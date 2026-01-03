

String.prototype.toPersianDigits = function () {
       return this.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
}