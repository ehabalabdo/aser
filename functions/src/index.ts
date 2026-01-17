import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// 1. Create Order Callable
// Calculates totals server-side to prevent tampering.
export const createOrder = functions.https.onCall(async (data, context) => {
    try {
        const { items, address } = data;

        // Auth check (optional, but recommended)
        // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

        // Validate inputs
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart is empty');
        }
        if (!address || !address.zoneId) {
            throw new functions.https.HttpsError('invalid-argument', 'Address incomplete');
        }

        let subtotal = 0;
        const orderItems = [];

        // Verify Prices from DB
        // Note: This does N reads. For high volume, cache prices or use map.
        // Use Promise.all
        for (const item of items) {
            const productSnap = await db.collection('products').doc(item.productId).get();
            if (!productSnap.exists) {
                throw new functions.https.HttpsError('not-found', \`Product \${item.productId} not found\`);
       }
       const productData = productSnap.data();
       if (!productData?.active) {
         throw new functions.https.HttpsError('failed-precondition', \`Product \${item.nameAr} is no longer active\`);
       }
       
       const price = Number(productData.price);
       const qty = Number(item.qty);
       const lineTotal = price * qty;
       
       subtotal += lineTotal;
       
       orderItems.push({
         productId: item.productId,
         nameAr: productData.nameAr,
         price: price,
         qty: qty,
         unit: productData.unit,
         lineTotal: lineTotal,
         imageUrl: productData.imageUrl || null
       });
    }

    // Get Delivery Fee
    const zoneSnap = await db.collection('delivery_zones').doc(address.zoneId).get();
    if (!zoneSnap.exists) {
       throw new functions.https.HttpsError('not-found', 'Invalid Delivery Zone');
    }
    const zoneData = zoneSnap.data();
    const deliveryFee = Number(zoneData?.fee || 0);

    const total = subtotal + deliveryFee;

    // Create Order
    const orderData = {
      userId: context.auth?.uid || 'guest',
      customer: {
        name: context.auth?.token.name || 'Guest',
        email: context.auth?.token.email || 'guest@example.com',
        phone: context.auth?.token.phone_number || '' // Might need to fetch from users profile if not in token
      },
      address: {
        ...address,
        zoneName: zoneData?.nameAr
      },
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "COD",
      status: "pending",
      createdAt: Date.now(),
      statusHistory: [{ status: 'pending', at: Date.now() }]
    };
    
    // If authenticated, try to get better customer info from profile
    if (context.auth?.uid) {
       const userSnap = await db.collection('users').doc(context.auth.uid).get();
       if (userSnap.exists) {
          const userData = userSnap.data();
          orderData.customer = {
             name: userData?.displayName || orderData.customer.name,
             email: userData?.email || orderData.customer.email,
             phone: userData?.phoneNumber || orderData.customer.phone
          };
          // Also save address to user profile for future? (Optional)
       }
    }

    const orderRef = await db.collection('orders').add(orderData);
    
    return { orderId: orderRef.id, total };
    
  } catch (error) {
    console.error("Create Order Error", error);
    throw new functions.https.HttpsError('internal', 'Order creation failed');
  }
});


// 2. Email Notification Trigger
export const onOrderCreated = functions.firestore.document('orders/{orderId}').onCreate(async (snap, context) => {
   const order = snap.data();
   const orderId = context.params.orderId;
   
   // Check Settings for Cashier Emails
   // Assuming simple config for now or Env vars
   const recipientEmails = process.env.CASHIER_EMAILS ? process.env.CASHIER_EMAILS.split(',') : []; // Set in functions config
   
   // Or fetch from settings doc
   // const settingsSnap = await db.doc('settings/app').get();
   // const recipients = settingsSnap.data()?.cashierEmails || [];

   if (recipientEmails.length === 0) {
      console.log("No cashier emails configured.");
      return;
   }

   const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS
      }
   });

   const mailOptions = {
      from: '"Veggie Orders" <noreply@veggie.jo>',
      to: recipientEmails.join(','),
      subject: \`New Order #\${orderId.slice(0,5)} - \${order.total} JOD\`,
      html: \`
         <h1>New Order Received</h1>
         <p><strong>Order ID:</strong> \${orderId}</p>
         <p><strong>Customer:</strong> \${order.customer.name} (\${order.customer.phone})</p>
         <p><strong>Total:</strong> \${order.total} JOD</p>
         <p><strong>Address:</strong> \${order.address.zoneName}, \${order.address.street}</p>
         <hr />
         <h3>Items:</h3>
         <ul>
            \${order.items.map((i: any) => \`<li>\${i.qty} x \${i.nameAr}</li>\`).join('')}
         </ul>
         <a href="https://veggie-orders-jo.web.app/cashier?id=\${orderId}">View in Dashboard</a>
      \`
   };

   try {
     await transporter.sendMail(mailOptions);
     console.log("Email sent for order", orderId);
   } catch (e) {
     console.error("Email failed", e);
   }
});
