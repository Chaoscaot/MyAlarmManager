import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";

function Layout({ children }: Readonly<{children: React.ReactNode}>) {
    return (
        <div className="flex flex-col items-center">
            <main className="w-full max-w-xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default Layout;