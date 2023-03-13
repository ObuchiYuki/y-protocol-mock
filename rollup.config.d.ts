declare const _default: ({
    input: string;
    output: {
        file: string;
        format: string;
        sourcemap: boolean;
        dir?: undefined;
        entryFileNames?: undefined;
        chunkFileNames?: undefined;
        paths?: undefined;
    };
    plugins: import(".pnpm/rollup@2.79.1/node_modules/rollup").Plugin[];
    external?: undefined;
} | {
    input: string[];
    output: {
        dir: string;
        format: string;
        sourcemap: boolean;
        entryFileNames: string;
        chunkFileNames: string;
        paths: (path: any) => any;
        file?: undefined;
    };
    external: (id: any) => boolean;
    plugins?: undefined;
})[];
export default _default;
//# sourceMappingURL=rollup.config.d.ts.map