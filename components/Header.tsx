
import React from 'react';
import { FaceSmileIcon } from './IconComponents';

interface HeaderProps {
    title: string;
    subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="w-full max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4">
                <FaceSmileIcon className="w-12 h-12 text-indigo-400" />
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400">
                        {title}
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">{subtitle}</p>
                </div>
            </div>
        </header>
    );
};
