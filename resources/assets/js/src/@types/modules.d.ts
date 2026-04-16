declare module "lodash/debounce" {
    export default function debounce<T extends (...args: any[]) => any>(
        fn: T,
        wait?: number,
        options?: {
            leading?: boolean;
            trailing?: boolean;
            maxWait?: number;
        }
    ): T;
}
