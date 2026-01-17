"use client";

import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder: string;
}

export default function ImageUpload({ value, onChange, folder }: ImageUploadProps) {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);

        // DEMO MODE MOCK UPLOAD
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            console.log("Demo mode: Simulating upload");
            let p = 0;
            const interval = setInterval(() => {
                p += 10;
                setProgress(p);
                if (p >= 100) {
                    clearInterval(interval);
                    // Return a random food image from unsplash
                    const mockUrls = [
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
                        'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80',
                        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80'
                    ];
                    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
                    onChange(randomUrl);
                    setUploading(false);
                }
            }, 200);
            return;
        }

        const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (error) => {
                console.error(error);
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                onChange(downloadURL);
                setUploading(false);
            }
        );
    };

    if (value) {
        return (
            <div className="relative w-40 h-40">
                <Image
                    src={value}
                    alt="Upload"
                    fill
                    className="object-cover rounded-lg"
                />
                <button
                    onClick={() => onChange("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                            <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">اضغط لرفع صورة</p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
