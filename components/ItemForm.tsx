
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item, Platform, ItemCategory } from '../types';
import { getItems, saveItem, createEmptyItem, deleteItem } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './Toast';
import { ChevronLeft, Camera, Trash2, Loader2, Snowflake, Shirt, Footprints, Layers, Package, Tag, X, Image as ImageIcon } from 'lucide-react';

const BUCKET_NAME = 'item-images';

// Custom Pants Icon component to replace Scissors
const PantsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 22V12L5 3H19L20 12V22" />
    <path d="M4 12H20" />
    <path d="M12 12V22" />
  </svg>
);

const CATEGORIES: { id: ItemCategory; label: string; icon: any; color: string }[] = [
  { id: 'overalls', label: 'Kombinézy', icon: Snowflake, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  { id: 'jackets', label: 'Bundy', icon: Shirt, color: 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  { id: 'softshell', label: 'Softshell', icon: Layers, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' },
  { id: 'pants', label: 'Kalhoty', icon: PantsIcon, color: 'text-indigo-500 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' },
  { id: 'shoes', label: 'Boty', icon: Footprints, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' },
  { id: 'accessories', label: 'Doplňky', icon: Tag, color: 'text-pink-500 bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800' },
  { id: 'other', label: 'Ostatní', icon: Package, color: 'text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' },
];

const ItemForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState<Item>(createEmptyItem());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Swipe Refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const loadItem = async () => {
        if (id) {
            const items = await getItems();
            const found = items.find(i => i.id === id);
            if (found) {
                if (!found.category) found.category = 'other';
                setItem(found);
            } else {
                navigate('/', { replace: true });
            }
        }
        setLoading(false);
    };
    loadItem();
  }, [id, navigate]);

  const handleChange = (field: keyof Item, value: any) => {
    setItem(prev => ({ ...prev, [field]: value }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (item.images.length >= 5) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // Compress image on canvas
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            // Reduced to 400px for faster loading
            const maxSize = 400;

            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to compress image'));
              },
              'image/jpeg',
              0.7
            );
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Supabase Storage if configured
      if (isSupabaseConfigured()) {
        const fileName = `${item.id}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        setItem(prev => {
          const newImages = [...(prev.images || []), urlData.publicUrl];
          setActiveImageIndex(newImages.length - 1);
          return { ...prev, images: newImages };
        });
      } else {
        // Fallback to base64 for offline/local mode
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(compressedBlob);
        });

        setItem(prev => {
          const newImages = [...(prev.images || []), dataUrl];
          setActiveImageIndex(newImages.length - 1);
          return { ...prev, images: newImages };
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Nepodařilo se nahrát obrázek. Zkuste to znovu.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
      setItem(prev => {
          const newImages = prev.images.filter((_, index) => index !== indexToRemove);
          // Adjust active index if necessary
          if (activeImageIndex >= newImages.length) {
              setActiveImageIndex(Math.max(0, newImages.length - 1));
          } else if (activeImageIndex === indexToRemove) {
              setActiveImageIndex(Math.max(0, activeImageIndex - 1));
          }
          return { ...prev, images: newImages };
      });
  };

  const handleSave = async () => {
    if (!item.name) {
      toast.warning('Zadejte název položky');
      return;
    }
    if (item.purchasePrice < 0) {
      toast.warning('Cena nemůže být záporná');
      return;
    }

    setSaving(true);
    try {
      await saveItem(item);
      toast.success(id ? 'Položka uložena' : 'Položka vytvořena');
      setSaving(false);
      navigate(-1);
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Nepodařilo se uložit. Zkuste odebrat některé fotky.');
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Opravdu chcete tuto položku smazat? Tato akce je nevratná.')) {
        setSaving(true);
        try {
          await deleteItem(item.id);
          toast.success('Položka smazána');
          navigate('/', { replace: true });
        } catch (error) {
          toast.error('Chyba při mazání položky.');
          setSaving(false);
        }
    }
  };

  const handleToggleSold = () => {
    if (item.status === 'active') {
        setItem(prev => ({
            ...prev,
            status: 'sold',
            saleDate: new Date().toISOString().split('T')[0]
        }));
    } else {
        setItem(prev => ({ ...prev, status: 'active', salePrice: undefined, fees: undefined }));
    }
  };

  // --- Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50; // Threshold

    if (isSwipe) {
      if (distance > 0) {
        // Swipe Left -> Next
        if (activeImageIndex < item.images.length - 1) {
            setActiveImageIndex(prev => prev + 1);
        }
      } else {
        // Swipe Right -> Prev
        if (activeImageIndex > 0) {
            setActiveImageIndex(prev => prev - 1);
        }
      }
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const platforms: Platform[] = ['Vinted', 'Facebook', 'Aukro', 'Depop', 'Jiné'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-ios-blue">
        <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-24 animate-slide-up text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ios-blue flex items-center -ml-2" disabled={saving}>
          <ChevronLeft size={24} />
          <span className="text-base font-normal">Zpět</span>
        </button>
        <h1 className="text-base font-semibold text-black dark:text-white">{id ? 'Upravit položku' : 'Nová položka'}</h1>
        <button onClick={handleSave} className="text-ios-blue font-semibold text-base flex items-center" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : 'Uložit'}
        </button>
      </header>

      <div className="p-5 space-y-6 max-w-md mx-auto">
        {/* Main Image Carousel & Management */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase ml-1">Fotky ({item.images.length}/5)</label>
            </div>

            {/* Main Featured Image / Carousel */}
            {item.images.length > 0 ? (
                <div
                    className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={item.images[activeImageIndex]}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        alt="Náhled"
                    />
                    {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={32} />
                        </div>
                    )}

                    {/* Pagination Dots (Inside Main Image) */}
                    {item.images.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                            {item.images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full shadow-sm transition-all duration-300 ${
                                        idx === activeImageIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Quick Delete for current image */}
                    <button
                        onClick={() => removeImage(activeImageIndex)}
                        className="absolute top-3 right-3 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !saving && !uploadingImage && fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] bg-gray-50 dark:bg-[#1C1C1E] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                >
                    {uploadingImage ? (
                        <>
                            <Loader2 className="animate-spin text-ios-blue mb-3" size={32} />
                            <span className="text-sm font-semibold text-ios-blue">Nahrávání...</span>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full mb-3">
                                <ImageIcon className="text-gray-400 dark:text-gray-500" size={32} />
                            </div>
                            <span className="text-sm font-semibold text-ios-blue">Nahrát první fotku</span>
                            <span className="text-xs text-gray-400 mt-1">Kliknutím otevřete galerii</span>
                        </>
                    )}
                </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* Thumbnail Strip (Filmstrip) */}
            {item.images.length > 0 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 snap-x px-1">
                    {/* Add Button (Small) */}
                    {item.images.length < 5 && (
                        <div
                            onClick={() => !saving && !uploadingImage && fileInputRef.current?.click()}
                            className={`flex-shrink-0 w-20 h-20 bg-gray-50 dark:bg-[#1C1C1E] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors snap-start ${uploadingImage ? 'opacity-50' : ''}`}
                        >
                            {uploadingImage ? (
                                <Loader2 className="animate-spin text-gray-400" size={20} />
                            ) : (
                                <>
                                    <Camera className="text-gray-400" size={20} />
                                    <span className="text-[9px] font-semibold text-gray-500 mt-1">Přidat</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Image List */}
                    {item.images.map((imgSrc, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 relative rounded-xl overflow-hidden shadow-sm border snap-start transition-all ${
                                index === activeImageIndex
                                ? 'ring-2 ring-ios-blue ring-offset-2 dark:ring-offset-black border-transparent'
                                : 'border-gray-100 dark:border-gray-700 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={imgSrc}
                                className="w-full h-full object-cover"
                                alt={`Thumb ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Basic Info Section */}
        <section className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Název</label>
                <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-4 rounded-xl text-lg font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                    placeholder="Např. Reima Gotland"
                    disabled={saving}
                />
            </div>

            {/* Category Selector */}
            <div>
                 <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-2 ml-1">Kategorie</label>
                 <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleChange('category', cat.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            item.category === cat.id
                            ? `${cat.color} ring-1 ring-offset-1 dark:ring-offset-black`
                            : 'bg-white dark:bg-[#1C1C1E] border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                            <cat.icon size={20} className={item.category === cat.id ? 'text-inherit' : 'text-gray-400'} />
                            <span className="text-[10px] font-medium mt-1 truncate w-full text-center">{cat.label}</span>
                        </button>
                    ))}
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Cena (Kč)</label>
                    <input
                        type="number"
                        value={item.purchasePrice === 0 ? '' : item.purchasePrice}
                        onChange={(e) => handleChange('purchasePrice', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                        placeholder="0"
                        disabled={saving}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Datum nákupu</label>
                    <input
                        type="date"
                        value={item.purchaseDate}
                        onChange={(e) => handleChange('purchaseDate', e.target.value)}
                        className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue dark:color-scheme-dark"
                        disabled={saving}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Zdroj</label>
                <input
                    type="text"
                    value={item.purchaseSource}
                    onChange={(e) => handleChange('purchaseSource', e.target.value)}
                    className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                    placeholder="Např. Sekáč, Vinted..."
                    disabled={saving}
                />
            </div>

            {/* Size and Condition */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Velikost</label>
                    <input
                        type="text"
                        value={item.size || ''}
                        onChange={(e) => handleChange('size', e.target.value)}
                        className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                        placeholder="Např. 110, 116..."
                        disabled={saving}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Stav</label>
                    <select
                        value={item.condition || ''}
                        onChange={(e) => handleChange('condition', e.target.value)}
                        className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-ios-blue"
                        disabled={saving}
                    >
                        <option value="">Vybrat stav</option>
                        <option value="new">Nové s visačkou</option>
                        <option value="like_new">Jako nové</option>
                        <option value="good">Dobrý stav</option>
                        <option value="fair">Použité</option>
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Poznámky</label>
                <textarea
                    value={item.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue resize-none"
                    placeholder="Další informace o položce..."
                    rows={2}
                    disabled={saving}
                />
            </div>

            {/* Listing URL - only for active items */}
            {item.status === 'active' && (
                <div>
                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Odkaz na inzerát</label>
                    <input
                        type="url"
                        value={item.listingUrl || ''}
                        onChange={(e) => handleChange('listingUrl', e.target.value)}
                        className="w-full bg-ios-gray dark:bg-[#1C1C1E] p-3 rounded-xl text-sm font-medium text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                        placeholder="https://vinted.cz/..."
                        disabled={saving}
                    />
                </div>
            )}
        </section>

        {/* Sale Section */}
        <section className="bg-gray-50 dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-black dark:text-white">Informace o prodeji</h3>
                <button
                    onClick={handleToggleSold}
                    disabled={saving}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        item.status === 'sold'
                        ? 'bg-ios-green text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                    {item.status === 'sold' ? 'Prodáno' : 'Označit jako prodané'}
                </button>
            </div>

            {item.status === 'sold' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Prodejní cena</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 font-medium">Kč</span>
                                <input
                                    type="number"
                                    value={item.salePrice || ''}
                                    onChange={(e) => handleChange('salePrice', Number(e.target.value))}
                                    className="w-full bg-white dark:bg-black pl-9 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-black dark:text-white font-medium focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue"
                                    placeholder="0"
                                    disabled={saving}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Datum prodeje</label>
                            <input
                                type="date"
                                value={item.saleDate || ''}
                                onChange={(e) => handleChange('saleDate', e.target.value)}
                                className="w-full bg-white dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-black dark:text-white font-medium focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue dark:color-scheme-dark"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Platforma</label>
                        <select
                            value={item.salePlatform || ''}
                            onChange={(e) => handleChange('salePlatform', e.target.value)}
                            className="w-full bg-white dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-black dark:text-white font-medium appearance-none focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue"
                            disabled={saving}
                        >
                            <option value="" disabled>Vybrat platformu</option>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Poplatky (Kč)</label>
                            <input
                                type="number"
                                value={item.fees || ''}
                                onChange={(e) => handleChange('fees', e.target.value === '' ? 0 : Number(e.target.value))}
                                className="w-full bg-white dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-black dark:text-white font-medium focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue"
                                placeholder="0"
                                disabled={saving}
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase mb-1 ml-1">Doprava (Kč)</label>
                            <input
                                type="number"
                                value={item.shippingCost || ''}
                                onChange={(e) => handleChange('shippingCost', e.target.value === '' ? 0 : Number(e.target.value))}
                                className="w-full bg-white dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-black dark:text-white font-medium focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue"
                                placeholder="0"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-900/30">
                        <span className="text-sm font-medium text-ios-blue">Odhadovaný zisk:</span>
                        <span className="text-lg font-bold text-ios-blue">
                             {((item.salePrice || 0) - item.purchasePrice - (item.fees || 0) - (item.shippingCost || 0)).toLocaleString('cs-CZ')} Kč
                        </span>
                    </div>
                </div>
            )}
        </section>

        {id && (
            <button
                onClick={handleDelete}
                disabled={saving}
                className="w-full py-4 text-ios-red font-medium flex items-center justify-center space-x-2 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-700 mt-8 active:bg-gray-50 dark:active:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                <span>{saving ? 'Mazání...' : 'Smazat položku'}</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default ItemForm;
