export interface Response {
    readonly answers: (Answer | null)[];
}

export type Answer = Radio | Checkbox;

export interface Radio {
    readonly type: 'radio';
    readonly item: string;
}

export interface Checkbox {
    readonly type: 'checkbox';
    readonly items: string[];
}