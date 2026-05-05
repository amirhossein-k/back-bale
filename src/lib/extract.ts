

export
    // تابع کمکی برای استخراج مبلغ از کپشن
    function extractAmountFromCaption(caption: string): number | undefined {
    if (!caption) return undefined;

    // الگوهای مختلف برای استخراج مبلغ
    const patterns = [
        /(\d{1,3}(?:,\d{3})*)\s*ریال/, // ۲۰,۰۰۰ ریال
        /(\d+)\s*تومان/, // ۲۰۰۰۰ تومان
        /مبلغ\s*:\s*(\d+)/, // مبلغ: ۲۰۰۰۰
        /(\d+)\s*هزار/, // ۲۰ هزار
    ];

    for (const pattern of patterns) {
        const match = caption.match(pattern);
        if (match) {
            const amountStr = match[1].replace(/,/g, '');
            const amount = parseInt(amountStr, 10);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }

    return undefined;
}