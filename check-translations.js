import fs from 'fs';

const content = fs.readFileSync('./src/i18n/ui.ts', 'utf8');

// Extract the translations object
const translationsMatch = content.match(/const translations = (\{[\s\S]*?\}) as const/);
if (!translationsMatch) {
  console.error('Could not find translations object');
  process.exit(1);
}

// Parse the translations object
let translationsStr = translationsMatch[1];
// Add quotes around keys that don't have them
translationsStr = translationsStr.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
// Replace single quotes with double quotes
translationsStr = translationsStr.replace(/'/g, '"');
// Parse as JSON
const translations = JSON.parse(translationsStr);

const enKeys = Object.keys(translations.en);
const zhKeys = Object.keys(translations['zh-CN']);

console.log('English keys:', enKeys.length);
console.log('Chinese keys:', zhKeys.length);

const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
const extraInZh = zhKeys.filter(key => !enKeys.includes(key));

if (missingInZh.length > 0) {
  console.log('\nMissing in Chinese:');
  missingInZh.forEach(key => console.log(`- ${key}`));
}

if (extraInZh.length > 0) {
  console.log('\nExtra in Chinese:');
  extraInZh.forEach(key => console.log(`- ${key}`));
}

if (missingInZh.length === 0 && extraInZh.length === 0) {
  console.log('\nAll keys are matched!');
}
