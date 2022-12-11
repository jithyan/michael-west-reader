import Svg, { Path } from "react-native-svg";

export function FilledTick() {
    return (
        <Svg viewBox="0 0 24 24" fill="#22c55e" className="w-6 h-6">
            <Path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
            />
        </Svg>
    );
}

export function UnfilledTick() {
    return (
        <Svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="cyan"
            className="w-6 h-6"
        >
            <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </Svg>
    );
}

export function Eye({ color = "#e7e5e4" }: { color?: string }) {
    return (
        <Svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={color}
            className="w-6 h-6"
        >
            <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </Svg>
    );
}
