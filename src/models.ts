export interface Survey {
    readonly questions: Question[];
}

export interface Question {
    readonly description: string;
    readonly answers: Answers;
}

export type Answers = Radio | Checkbox;

export interface Radio {
    readonly type: 'radio';
    readonly choices: string[];
}

export interface Checkbox {
    readonly type: 'checkbox';
    readonly choices: string[];
}