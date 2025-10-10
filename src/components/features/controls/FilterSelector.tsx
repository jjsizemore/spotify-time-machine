import LoadingSpinner from '@/ui/LoadingSpinner';
import ToggleButton from '@/ui/ToggleButton';

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
  emptyMessage = 'No items found',
  maxItems,
}: FilterSelectorProps<T>) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div>
      <label className="block text-spotify-white mb-2 font-medium">{title}</label>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="w-full bg-spotify-black rounded-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-[100px] max-h-[50vh] overflow-y-auto content-start p-4">
            {displayItems.map((item) => {
              const id = getItemId(item);
              const name = getItemName(item);
              return (
                <ToggleButton
                  key={id}
                  id={id}
                  label={name}
                  isSelected={selectedItems.includes(id)}
                  onClick={onToggleItem}
                />
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
