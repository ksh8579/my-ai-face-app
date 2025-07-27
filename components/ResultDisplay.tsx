
import React from 'react';
import { StarIcon, HeartIcon } from './IconComponents';

interface ResultDisplayProps {
    result: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
    const formatResult = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={index} className="text-xl font-bold text-green-400 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                }
                if (line.startsWith('* **') && line.endsWith('**')) {
                     return <h4 key={index} className="text-lg font-semibold text-indigo-300 mt-3 mb-1 ml-2">{line.replace('* **', '').replace('**', '')}</h4>;
                }
                if (line.trim().startsWith('*')) {
                    return <p key={index} className="text-gray-300 my-1 ml-4">{line.replace('*', '•')}</p>;
                }
                 if (line.includes('면책 조항:')) {
                    return <p key={index} className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-700">{line}</p>;
                }
                return <p key={index} className="text-gray-300 my-2">{line}</p>;
            });
    };

    return (
        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-green-400 max-w-none text-left whitespace-pre-wrap leading-relaxed">
            {formatResult(result)}
        </div>
    );
};


interface CelebrityResult {
    celebrityName: string;
    similarityScore: number;
    analysis: {
        facialFeatures: {
            feature: string;
            description: string;
        }[];
        overallImpression: string;
    };
}

interface CelebrityResultDisplayProps {
    result: CelebrityResult;
}

export const CelebrityResultDisplay: React.FC<CelebrityResultDisplayProps> = ({ result }) => {
    return (
        <div className="w-full text-left">
            <div className="text-center mb-6">
                <h3 className="text-lg text-gray-400 mb-2">당신과 가장 닮은 연예인은...</h3>
                <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    {result.celebrityName}
                </p>
                <div className="mt-3">
                    <span className="text-2xl font-bold text-yellow-400">{result.similarityScore}%</span>
                    <span className="ml-2 text-gray-400">일치</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-lg text-indigo-300 mb-2">⭐ 종합 인상</h4>
                    <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">{result.analysis.overallImpression}</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg text-indigo-300 mb-2">✨ 닮은 포인트</h4>
                    <ul className="space-y-2">
                        {result.analysis.facialFeatures.map((item, index) => (
                            <li key={index} className="bg-gray-700/50 p-3 rounded-lg">
                                <p className="font-semibold text-green-400">{item.feature}</p>
                                <p className="text-gray-300 text-sm">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-700 text-center">
                면책 조항: 이 분석은 오락적인 목적으로 제공됩니다.
            </p>
        </div>
    );
};


interface SoulmateResult {
    celebrityName: string;
    matchScore: number;
    analysis: {
        overall: string;
        compatibilityPoints: string[];
    };
    advice: string;
}

interface SoulmateResultDisplayProps {
    result: SoulmateResult;
}

export const SoulmateResultDisplay: React.FC<SoulmateResultDisplayProps> = ({ result }) => {
    return (
        <div className="w-full text-left">
            <div className="text-center mb-6">
                 <h3 className="text-lg text-gray-400 mb-2">당신의 천생연분 연예인은...</h3>
                 <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">
                    {result.celebrityName}
                </p>
                <div className="mt-3 flex items-center justify-center space-x-2">
                    <HeartIcon className="w-7 h-7 text-pink-500" />
                    <span className="text-2xl font-bold text-pink-400">궁합 {result.matchScore}%</span>
                    <HeartIcon className="w-7 h-7 text-pink-500" />
                </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <h4 className="font-bold text-lg text-indigo-300 mb-2">💖 환상의 케미</h4>
                    <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">{result.analysis.overall}</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg text-indigo-300 mb-2">💑 관상 궁합 포인트</h4>
                    <ul className="space-y-2 list-disc list-inside">
                        {result.analysis.compatibilityPoints.map((point, index) => (
                           <li key={index} className="text-gray-300">{point}</li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold text-lg text-indigo-300 mb-2">💌 로맨틱 조언</h4>
                    <p className="text-gray-300 italic bg-gray-700/50 p-3 rounded-lg">"{result.advice}"</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-700 text-center">
                면책 조항: 이 분석은 오락적인 목적으로 제공되며, 실제 궁합과는 관련이 없습니다.
            </p>
        </div>
    );
}
