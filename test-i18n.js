import { getUiText, setUiLanguage, getUiLanguage } from './src/i18n/ui.ts';

// Test English language
console.log('Testing English language:');
setUiLanguage('en');
console.log('Current language:', getUiLanguage());
console.log('welcomeMessage:', getUiText('welcomeMessage'));
console.log('setupLanguageTitle:', getUiText('setupLanguageTitle'));
console.log('securityTitle:', getUiText('securityTitle'));
console.log('terminalSetupTitle:', getUiText('terminalSetupTitle'));
console.log('apiTypeLabel:', getUiText('apiTypeLabel'));

// Test Chinese language
console.log('\nTesting Chinese language:');
setUiLanguage('zh-CN');
console.log('Current language:', getUiLanguage());
console.log('welcomeMessage:', getUiText('welcomeMessage'));
console.log('setupLanguageTitle:', getUiText('setupLanguageTitle'));
console.log('securityTitle:', getUiText('securityTitle'));
console.log('terminalSetupTitle:', getUiText('terminalSetupTitle'));
console.log('apiTypeLabel:', getUiText('apiTypeLabel'));

// Test with variables
console.log('\nTesting with variables:');
console.log('pressAgainToExit:', getUiText('pressAgainToExit', { key: 'Ctrl+C' }));
console.log('welcomeBackWithName:', getUiText('welcomeBackWithName', { username: 'User' }));
console.log('fastModeSubtitle:', getUiText('fastModeSubtitle', { model: 'Claude 3' }));
