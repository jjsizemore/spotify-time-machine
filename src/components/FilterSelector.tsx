import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface FilterSelectorProps<T> {
  title: string;
  items: T[];
  selectedItems: string[];
  isLoading: boolean;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  onToggleItem: (id: string) => void;
  emptyMessage?: string;
  maxItems?: number;
}

export default function FilterSelector<T>({
  title,
  items,
  selectedItems,
  isLoading,
  getItemId,
  getItemName,
  onToggleItem,
  emptyMessage = "No items found",
  maxItems
}: FilterSelectorProps<T>) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div>
      <label className="block text-spotify-white mb-2 font-medium">
        {title}
      </label>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="w-full bg-spotify-black rounded-md p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-40 overflow-y-auto content-start">
            {displayItems.map(item => {
              const id = getItemId(item);
              const name = getItemName(item);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleItem(id)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    selectedItems.includes(id)
                      ? 'bg-spotify-green text-spotify-black'
                      : 'bg-spotify-medium-gray text-spotify-white'
                  }`}
                >
                  {name}
                </button>
              );
            })}
            {displayItems.length === 0 && (
              <p className="text-spotify-light-gray text-sm p-2">{emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}