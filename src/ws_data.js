const indexToCheckCategoryByDomain = {
	en: [
		'Index_-_File_to_check'
	],
	fa: [
		'آثار نیازمند رسیدگی به پرونده' // to check
	],
	be: [
		'Вікікрыніцы:Індэксы з няслушным файлам' // to fix
	],
	bn: [
		'নির্ঘণ্ট-ফাইলকে পরীক্ষা করা প্রয়োজন' // to check
	],
	br: [
		'Menegerioù gant ur restr siek' // to fix
	],
	ca: [
		'Llibres amb errors' // to fix
	],
	es: [
		'Índices dañados'
	],
	fr: [
		'Livres à réparer' // to fix
	],
	kr: [
		'색인 - 파일 검토 필요' // to check
	],
	mr: [
		'സൂചിക - ശരിയാക്കാനുള്ള പ്രമാണങ്ങൾ'
	],
	pa: [
		'Index - File to check'
	],
	pt: [
		'Originais a verificar' // to check
	],
	ru: [
		'Индекс - Исходный файл содержит ошибки' // to fix
	],
	th: [
		'ดัชนี - ต้องตรวจไฟล์' // to check
	],
	tr: [
		'Kontrol edilmesi gereken dizin dosyaları' // to check
	],
	uk: [
		'Індекс - Файли до перевірки' // to check
	],
	vi: [
		'Sách có tập tin cần kiểm' // to check
	]
};

function getIndexNs( domain ) {

	const doms = {
		en: 106,
		mul: 106,
		ar: 106,
		as: 106,
		be: 106,
		bn: 102,
		br: 100,
		ca: 104,
		cy: 106,
		da: 106,
		de: 104,
		el: 102,
		eo: 106,
		es: 104,
		et: 104,
		fa: 106,
		fr: 112,
		gu: 106,
		he: 112,
		hr: 104,
		hu: 106,
		hy: 106,
		id: 102,
		it: 110,
		kn: 106,
		la: 106,
		ml: 104,
		mr: 106,
		nl: 106,
		no: 106,
		pl: 102,
		pms: 104,
		pt: 104,
		ro: 106,
		ru: 106,
		sa: 106,
		sl: 104,
		sv: 108,
		te: 106,
		vec: 104,
		vi: 106,
		zh: 106
	};

	const ns = doms[ domain ];
	return ns || 252;
}

const wikisourceDomains = [
	'en', 'mul', 'ar', 'as', 'be', 'bn', 'br', 'ca', 'cy', 'da',
	'de', 'el', 'eo', 'es', 'et', 'fa', 'fr', 'gu', 'he', 'hr',
	'hu', 'hy', 'id', 'it', 'kn', 'la', 'ml', 'mr', 'nl', 'no',
	'pl', 'pms', 'pt', 'ro', 'ru', 'sa', 'sl', 'sv', 'te', 'vec', 'vi', 'zh'
];

module.exports = {
	indexToCheckCategoryByDomain,
	getIndexNs,
	wikisourceDomains
};
