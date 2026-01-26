/**
 * Migration script to move base64 images to Supabase Storage
 *
 * This script:
 * 1. Fetches all items from the database
 * 2. For each item with base64 images, uploads them to Storage
 * 3. Updates the item to use the new URL
 *
 * Run with: npx tsx scripts/migrate-images.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzwxhwitpislsmfcboan.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hod2l0cGlzbHNtZmNib2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDg3ODcsImV4cCI6MjA4MDE4NDc4N30.8Xzoujo_FUOPZBCta65-iAQY9Iv02RQ8WEd5qvCjGCw';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'item-images';

// Check if string is base64 image data
function isBase64Image(str: string): boolean {
  return str?.startsWith('data:image/') ||
         (str?.length > 1000 && !str?.startsWith('http'));
}

// Convert base64 to Blob
function base64ToBlob(base64: string): { blob: Blob; extension: string } {
  let data = base64;
  let mimeType = 'image/jpeg';
  let extension = 'jpg';

  if (base64.startsWith('data:')) {
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      data = matches[2];
      extension = mimeType.split('/')[1] || 'jpg';
      if (extension === 'jpeg') extension = 'jpg';
    }
  }

  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return { blob, extension };
}

async function uploadImage(itemId: string, imageData: string, index: number): Promise<string | null> {
  try {
    const { blob, extension } = base64ToBlob(imageData);
    const fileName = `${itemId}_${index}_${Date.now()}.${extension}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      console.error(`  Error uploading ${fileName}:`, error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log(`  Uploaded: ${fileName}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`  Error processing image:`, err);
    return null;
  }
}

async function migrateItem(item: any): Promise<boolean> {
  const itemData = item.data || item;
  const images = itemData.images || [];

  if (!images.length) {
    return false;
  }

  // Check if any images are base64
  const hasBase64 = images.some((img: string) => isBase64Image(img));
  if (!hasBase64) {
    console.log(`  Item ${item.id}: Already using URLs, skipping`);
    return false;
  }

  console.log(`  Item ${item.id}: Migrating ${images.length} image(s)...`);

  const newImages: string[] = [];
  let migrated = false;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    if (isBase64Image(img)) {
      const url = await uploadImage(item.id, img, i);
      if (url) {
        newImages.push(url);
        migrated = true;
      } else {
        // Keep original if upload failed
        newImages.push(img);
      }
    } else {
      // Already a URL, keep it
      newImages.push(img);
    }
  }

  if (migrated) {
    // Update the item in database
    const updatedData = { ...itemData, images: newImages };

    const { error } = await supabase
      .from('items')
      .update({ data: updatedData })
      .eq('id', item.id);

    if (error) {
      console.error(`  Error updating item ${item.id}:`, error.message);
      return false;
    }

    console.log(`  Item ${item.id}: Successfully migrated!`);
  }

  return migrated;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Image Migration Script');
  console.log('='.repeat(50));
  console.log('');

  // Fetch all items (in batches to avoid timeout)
  console.log('Fetching items from database...');

  let allItems: any[] = [];
  let offset = 0;
  const batchSize = 50;

  while (true) {
    const { data, error } = await supabase
      .from('items')
      .select('id, data')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error fetching items:', error.message);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    allItems = allItems.concat(data);
    console.log(`  Fetched ${allItems.length} items so far...`);

    if (data.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  console.log(`\nTotal items found: ${allItems.length}`);
  console.log('');

  // Migrate each item
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const item of allItems) {
    try {
      const wasMigrated = await migrateItem(item);
      if (wasMigrated) {
        migratedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`  Error processing item ${item.id}:`, err);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('Migration Complete!');
  console.log('='.repeat(50));
  console.log(`  Migrated: ${migratedCount} items`);
  console.log(`  Skipped:  ${skippedCount} items (already URLs or no images)`);
  console.log(`  Errors:   ${errorCount} items`);
  console.log('');
}

main().catch(console.error);
