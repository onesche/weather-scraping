/**
 * This class for managing dates.
 */
export class LocalDate {

    private date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    /**
     * Acquires the stored date class as a character string according to the format of the argument.
     *
     * @param format Date format
     * @return formatted date string
     */
    format(format: string): string {
        format = format.replace(/YYYY/, String(this.date.getFullYear()));
        format = format.replace(/MM/, String(this.date.getMonth() + 1));
        format = format.replace(/DD/, String(this.date.getDate()));
        return format;
    }

    /**
     * Add the number of days specified by the argument to the stored date.
     *
     * @param day Add the number of days
     */
    plusDays(day: number) {
        this.date.setDate(this.date.getDate() + day);
    }

    /**
     * Create current date
     *
     * @return current date
     */
    static now(): LocalDate {
        return new LocalDate(new Date());
    }
}

/**
 * The class for static date format.
 */
export class DateFormat {
    static readonly YYYY_MM_DD = 'YYYY-MM-DD';
}
