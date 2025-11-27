// Helper for formatting with thousand separators
const formatWithThousands = (val, decimals = 2, separator = ' ') => {
    return val
        .toFixed(decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

// Existing currencies
DEF.currencies.eur = (val) => {
    return (val % 1 === 0
        ? formatWithThousands(val, 0)
        : formatWithThousands(val, 2)
    ) + ' €';
};

DEF.currencies.czk = (val) => {
    let price;
    if (val % 1 === 0) {
        price = formatWithThousands(val, 0, ' ');
    } else {
        price = formatWithThousands(val, 2, ' ');
    }
    return price + ' Kč';
};

DEF.currencies.gbp = (val) => '£' + formatWithThousands(val, 2, ',');
DEF.currencies.ron = (val) => formatWithThousands(val, 2, ' ') + ' lei';
DEF.currencies.sek = (val) => formatWithThousands(val, 2, ' ') + ' kr';

// Additional European currencies
DEF.currencies.chf = (val) => formatWithThousands(val, 2, "'") + ' CHF'; // Swiss Franc with apostrophe separator
DEF.currencies.dkk = (val) => formatWithThousands(val, 2, '.') + ' kr';  // Danish Krone
DEF.currencies.nok = (val) => formatWithThousands(val, 2, ' ') + ' kr';  // Norwegian Krone
DEF.currencies.huf = (val) => formatWithThousands(val, 0, ' ') + ' Ft';  // Hungarian Forint, no decimals
DEF.currencies.pln = (val) => formatWithThousands(val, 2, ' ') + ' zł';  // Polish Złoty
DEF.currencies.bgn = (val) => formatWithThousands(val, 2, ' ') + ' лв';  // Bulgarian Lev
DEF.currencies.isk = (val) => formatWithThousands(val, 0, ' ') + ' kr';  // Icelandic Krona, no decimals
