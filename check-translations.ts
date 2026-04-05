import { translations } from './src/i18n/ui.ts';

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
