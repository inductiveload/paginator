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

module.exports = {
	getIndexNs
};
