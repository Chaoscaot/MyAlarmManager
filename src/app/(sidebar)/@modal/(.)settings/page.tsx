"use client"

import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "~/components/ui/dialog";
import {useRouter} from "next/navigation";
import SettingsPage from "~/app/(sidebar)/settings/page"
import {DialogBody} from "next/dist/client/components/react-dev-overlay/ui/components/dialog";

export default function Settings() {
    const router = useRouter();

    return (
        <Dialog defaultOpen={true} modal={true} open={true} onOpenChange={(to) => !to && router.back()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <SettingsPage />
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}