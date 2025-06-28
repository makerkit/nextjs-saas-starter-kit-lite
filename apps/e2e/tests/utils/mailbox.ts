import { Page } from '@playwright/test';
import { parse } from 'node-html-parser';

export class Mailbox {
  constructor(private readonly page: Page) {}

  async visitMailbox(
    email: string,
    params: {
      deleteAfter: boolean;
    },
  ) {
    console.log(`Visiting mailbox ${email} ...`);

    const json = await this.getInviteEmail(email, params);

    if (!json?.HTML) {
      throw new Error('Email body was not found');
    }

    console.log('Email found');

    const html = json.HTML;
    const el = parse(html);

    const linkHref = el.querySelector('a')?.getAttribute('href');

    if (!linkHref) {
      throw new Error('No link found in email');
    }

    console.log(`Visiting ${linkHref} from mailbox ${email}...`);

    return this.page.goto(linkHref);
  }

  async getInviteEmail(
    email: string,
    params: {
      deleteAfter: boolean;
    },
  ) {
    const url = `http://127.0.0.1:54324/api/v1/search?query=to:${encodeURIComponent(email)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const json = (await response.json()) as { messages: Array<{ ID: string }> };

    if (!json?.messages || !json.messages.length) {
      return;
    }

    const messageId = json.messages[0]?.ID;
    const messageUrl = `http://127.0.0.1:54324/api/v1/message/${messageId}`;

    const messageResponse = await fetch(messageUrl);

    if (!messageResponse.ok) {
      throw new Error(`Failed to fetch email: ${messageResponse.statusText}`);
    }

    // delete message
    if (params.deleteAfter) {
      console.log(`Deleting email ${messageId} ...`);

      const res = await fetch(messageUrl, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error(`Failed to delete email: ${res.statusText}`);
      }
    }

    return await messageResponse.json();
  }
}
