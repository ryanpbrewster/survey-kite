export interface Survey {
    readonly questions: Question[];
}

export interface Question {
    readonly description: string;
    readonly choices: Choices;
}

export type Choices = Radio | Checkbox;

export interface Radio {
    readonly type: 'radio';
    readonly items: string[];
}

export interface Checkbox {
    readonly type: 'checkbox';
    readonly items: string[];
}