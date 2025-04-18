import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalFlag } from '@/renderer/context/GlobalFlagContext';
import useSidebarDragDrop from '@/renderer/hooks/useSidebarDragDrop';
import './Sidebar.css';
import SidebarIcon from '@/renderer/components/Sidebar/SidebarIcon';
import SidebarPanel from '@/renderer/components/Sidebar/SidebarPanel';
import { getInitialItems } from '@/renderer/components/Sidebar/SidebarInitialItems';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState<string | null>('projects'); // 初期値で'projects'を選択
  const [isPinned, setIsPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isSidebarVisible } = useGlobalFlag();

  // 初期アイテムを取得
  const initialItems = getInitialItems();

  // ドラッグアンドドロップのロジックをカスタムフックに移動
  const {
    items: sidebarItems,
    setItems: setSidebarItems,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useSidebarDragDrop(initialItems);

  // 外部クリックで非ピン留めパネルを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isPinned &&
        activeItem &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setActiveItem(null);

        // サイドバー状態変更イベントを発火
        const changeEvent = new CustomEvent('sidebar-change', {
          detail: { isOpen: false },
        });
        window.dispatchEvent(changeEvent);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPinned, activeItem]);

  // サイドバーアイコンクリック時の処理
  const handleIconClick = (id: string) => {
    const newState = activeItem === id ? null : id;
    setActiveItem(newState);

    // サイドバー状態変更イベントを発火
    const event = new CustomEvent('sidebar-change', {
      detail: { isOpen: newState !== null },
    });
    window.dispatchEvent(event);
  };

  // ピン留め状態の切り替え
  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  // アクティブなアイテムを取得
  const getActiveItem = () => {
    const item = sidebarItems.find((item) => item.id === activeItem) || null;
    return item;
  };

  if (!isSidebarVisible) {
    return null; // フラグがfalseの場合はレンダリングしない
  }

  return (
    <div
      className="sidebar-container"
      ref={sidebarRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* サイドバーアイコン領域 */}
      <div className="sidebar-icons">
        <div className="icons-container">
          {sidebarItems.map((item) => {
            // 各アイコンの有効/無効状態を判定関数から取得
            const isEnabled = item.isEnabled ? item.isEnabled() : true;

            return (
              <SidebarIcon
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                disabled={!isEnabled}
                onClick={handleIconClick}
                onDragStart={handleDragStart}
              />
            );
          })}
        </div>
      </div>

      {/* サイドバーパネル領域 */}
      {activeItem && (
        <SidebarPanel
          isPinned={isPinned}
          togglePin={togglePin}
          activeItem={getActiveItem()}
        />
      )}
    </div>
  );
}
