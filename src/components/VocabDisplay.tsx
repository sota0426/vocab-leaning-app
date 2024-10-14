// src/components/VocabDisplay.tsx

import React, { useState, useEffect } from 'react';
import vocabData from '../data/vocabData.json';
import DisplayWords from './DisplayWords';
import DisplayImage from './DisplayImage';
import AudioPlayer from './AudioPlayer';
import NavigationControls from './AudioNavigationControls';
import SettingsModal from './DisplaySettingsModal';
import { Settings } from 'lucide-react';
import AudioSettingsModal from './AudioSettingsModal';
import { VocabWord, SelectedItem } from '../types';

export default function VocabDisplay() {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0); // 現在の単語のインデックス
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0); // 現在の音声のインデックス
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 音声再生の状態
  const [playbackRate, setPlaybackRate] = useState<number>(1); // 再生速度
  const [nextWordDelay, setNextWordDelay] = useState<number>(1); // 次の単語までの遅延時間

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 設定モーダル
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false); // 音声設定モーダル
  const currentWordData: VocabWord = vocabData[currentWordIndex];

  // 選択された項目の初期状態
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    {
      id: '英語_男性_1',
      label: '',
      language: '英語',
      gender: '男性',
      wordNumber: 1,
      japaneseSentence: '',
      englishSentence: '',
      showJapaneseSentence: false,
      showEnglishSentence: true,
    },
    {
      id: '日本語_男性_1',
      label: '',
      language: '日本語',
      gender: '男性',
      wordNumber: 1,
      japaneseSentence: '',
      englishSentence: '',
      showJapaneseSentence: true,
      showEnglishSentence: false,
    },
  ]);

  // 現在のオーディオソースを取得する関数
  const getAudioSource = (): string => {
    // 現在のオーディオインデックスが選択された項目の数を超えている場合、空文字を返す
    if (currentAudioIndex >= selectedItems.length) {
      return '';
    }

    // 現在のオーディオインデックスに対応する選択項目を取得
    const item = selectedItems[currentAudioIndex];

    // 言語、性別、単語番号に基づいてオーディオキーを生成
    const audioKey = `${item.language === '英語' ? 'ENG' : 'JPN'}_${
      item.gender === '女性' ? 'female' : 'male'
    }_${item.wordNumber}`;

    // 生成したオーディオキーを使用して、現在の単語データからオーディオパスを取得
    let audioPath = currentWordData[audioKey as keyof VocabWord] as string;

    // オーディオパスが存在しない場合、警告をコンソールに表示して空文字を返す
    if (!audioPath) {
      console.warn(`Audio file not found for key: ${audioKey}`);
      return '';
    }

    // パス内のバックスラッシュをスラッシュに置き換える（URL形式に適合させるため）
    audioPath = audioPath.replace(/\\/g, '/');

    // パスの先頭に 'public/' が含まれている場合、それを削除
    // React の場合、public フォルダ内のファイルはルートからアクセス可能なため
    if (audioPath.startsWith('public/')) {
      audioPath = audioPath.replace('public/', '/');
    }

    // 調整後のオーディオパスをコンソールにログ出力（デバッグ用）
    console.log('Adjusted Audio Path:', audioPath);

    // 調整済みのオーディオパスを返す
    return audioPath;
  };

  // 表示する単語を取得する関数
  const getDisplayWord = (): VocabWord => {
    return currentWordData;
  };

  // displayOptions を追加
  const [displayOptions, setDisplayOptions] = useState({
    showWordPronunciation: true,
    showWordDescription: true,
    showWordClass: true,
    showWordStructure: true,
    showWordAlt: true,
  });

  // 画像パスをフォーマットする関数
  const getImagePath = (imagePath: string): string => {
    if (imagePath.startsWith('public\\')) {
      return '/' + imagePath.replace('public\\', '').replace('\\', '/');
    }
    return imagePath;
  };

  // 次の単語に進む関数
  const nextWord = () => {
    setCurrentWordIndex((prevIndex) =>
      prevIndex < vocabData.length - 1 ? prevIndex + 1 : 0
    );
    setCurrentAudioIndex(0);
  };

  // 前の単語に戻る関数
  const prevWord = () => {
    setCurrentWordIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : vocabData.length - 1
    );
    setCurrentAudioIndex(0);
  };

  // オーディオ再生が終了したときのハンドラ
  const handleAudioEnded = () => {
    setTimeout(() => {
      if (currentAudioIndex < selectedItems.length - 1) {
        setCurrentAudioIndex((prevIndex) => prevIndex + 1);
        setIsPlaying(true);
      } else {
        setCurrentAudioIndex(0);
        nextWord(); // 自動的に次の単語に進む
        setIsPlaying(true); // 次の単語を再生
      }
    }, nextWordDelay * 1000);
  };

  // オーディオ再生の開始（プレースホルダ）
  useEffect(() => {
    if (isPlaying) {
    }
  }, [currentWordIndex, currentAudioIndex, isPlaying,isAudioSettingsOpen]);

  // デバッグ用: selectedItems と currentAudioIndex をログ出力
  useEffect(() => {
    console.log('Selected Items:', selectedItems);
    console.log('Current Audio Index:', currentAudioIndex);
  }, [selectedItems, currentAudioIndex]);

  // 現在の単語番号
  const currentWordNumber = selectedItems[currentAudioIndex]?.wordNumber || 1;

  // 現在の単語番号に基づいて、英語と日本語の表示フラグを取得
  const showEnglish = selectedItems.some(
    (item) =>
      item.wordNumber === currentWordNumber &&
      item.language === '英語' &&
      item.showEnglishSentence
  );

  const showJapanese = selectedItems.some(
    (item) =>
      item.wordNumber === currentWordNumber &&
      item.language === '日本語' &&
      item.showJapaneseSentence
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-blue-100 font-sans p-6">
      {/* メインコンテンツのコンテナ */}
      <div className="flex flex-col md:flex-row justify-center items-center h-full space-y-4 md:space-y-0 md:space-x-6 mb-6">
        
        {/* 単語の表示 */}
        <div className="flex-grow w-full md:w-1/2 bg-white shadow-lg rounded-lg p-8 pt-8 transition-all duration-300 ease-in-out hover:shadow-xl">
          <div className="flex flex-col items-center justify-center">
            {/* DisplayWords コンポーネントに currentWord と wordNumber を渡す */}
            <DisplayWords 
              word={getDisplayWord()} 
              number={currentWordNumber} 
              showEnglish={showEnglish}
              showJapanese={showJapanese}
              displayOptions={displayOptions}
            />
          </div>
        </div>

        {/* 画像の表示 */}
        <div className="flex-grow w-full md:w-1/2 bg-white shadow-lg rounded-lg p-8 transition-all duration-300 ease-in-out hover:shadow-xl flex items-center justify-center">
          <DisplayImage imagePath={getImagePath(currentWordData.img_URL)} />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* ナビゲーションとオーディオプレーヤー */}
        {/* 音声プレーヤーの部分 */}
        <AudioPlayer
          src={getAudioSource()}
          playbackRate={playbackRate}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onStop={() => setIsPlaying(false)}
          onEnded={handleAudioEnded}
        />

        <NavigationControls
          onPrev={prevWord}
          onNext={nextWord}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((prev) => !prev)}
        />

        <p className="text-sm text-gray-500">
          現在の再生順序: {selectedItems.map(item => item.id).join(' → ') || 'なし'}
        </p>

        {/* ボタンのグループ */}
        <div className="flex space-x-4">
          {/* 設定ボタン */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center space-x-1"
          >
            <Settings className="w-5 h-5" />
            <span>設定</span>
          </button>

          {/* 音声設定ボタン */}
          <button
            onClick={() => setIsAudioSettingsOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center space-x-1"
          >
            <Settings className="w-5 h-5" />
            <span>音声設定</span>
          </button>
        </div>

        {/* 設定モーダル */}
        {isModalOpen && (
          <SettingsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            nextWordDelay={nextWordDelay}
            setNextWordDelay={setNextWordDelay}
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />
        )}

        {/* 音声設定モーダル */}
        {isAudioSettingsOpen && (
          <AudioSettingsModal
            isOpen={isAudioSettingsOpen}
            onClose={() => setIsAudioSettingsOpen(false)}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        )}
      </div>
    </div>
  );
}
