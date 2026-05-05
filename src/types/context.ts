export interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface Chat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface Message {
    message_id: number;
    from?: User;
    date: number;
    chat: Chat;
    text?: string;
    caption?: string;
    // سایر فیلدهای پیام می‌توانند اضافه شوند
}

export interface Update {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    channel_post?: Message;
    edited_channel_post?: Message;
    // سایر انواع آپدیت‌ها
}

export interface TelegramOptions {
    apiRoot: string;
    apiMode: 'bot';
    webhookReply: boolean;
    agent: any; // Agent type
    attachmentAgent?: any;
    testEnv: boolean;
}

export interface Telegram {
    token: string;
    response?: any;
    options: TelegramOptions;
}

export interface BotInfo {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name: string;
    username: string;
}

// تایپ اصلی Context
export interface Context {
    update: Update;
    telegram: Telegram;
    botInfo: BotInfo;
    state: Record<string, any>;

    // متدهای رایج Context
    reply?: (text: string, extra?: any) => Promise<any>;
    replyWithMarkdown?: (text: string, extra?: any) => Promise<any>;
    replyWithHTML?: (text: string, extra?: any) => Promise<any>;
    deleteMessage?: (messageId?: number) => Promise<any>;
    getChat?: () => Promise<Chat>;
    getChatMember?: (userId: number) => Promise<any>;
    leaveChat?: () => Promise<any>;
    // سایر متدها...
}

export type MessageHandler = (ctx: Context) => Promise<void> | void;
