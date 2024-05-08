import { Injectable, inject, signal } from '@angular/core';
import { FirebaseInitService } from './firebase-init.service';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { UserService } from './user.service';
import { ThreadsService } from './ThreadsService';
import { MessageService } from './message.service';
import { ChannelService } from './channel.service';
import { Subscription } from 'rxjs';
import { User } from '../shared/models/user.class';
import { Channel } from '../shared/models/channel.class';
import { Message } from '../shared/models/message.class';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  firebaseInitService = inject(FirebaseInitService);
  userService = inject(UserService);
  threadsService = inject(ThreadsService);
  messageService = inject(MessageService);
  channelService = inject(ChannelService);

  searchUserResult: User[] = [];
  searchChannelsResult: Channel[] = [];
  searchMessageResult: Message[] = [];
  searchThreadResult: Message[] = [];
  listOfAllUsers: User[] = [];
  listOfAllChannels: Channel[] = [];
  listOfAllMessages: Message[] = [];
  listOfAllThreads: Message[] = [];

  unsubUsers: Subscription;
  unsubChannel: Subscription;
  unsubMessages!: Subscription;

  constructor() {
    this.unsubUsers = this.userService.usersList$.subscribe((list) => {
      this.listOfAllUsers = list;
    });
    this.unsubChannel = this.channelService.channels$.subscribe((list) => {
      this.listOfAllChannels = list;
    });
  }

  ngOnDestroy(): void {
    this.unsubUsers.unsubscribe();
    this.unsubChannel.unsubscribe();
    this.unsubMessages.unsubscribe();
  }

  searchUsers(input: string) {
    this.searchUserResult = [];
    this.listOfAllUsers.forEach((user) => {
      let nameToCompareWith = user.name.toLowerCase();
      if (input.startsWith('@')) {
        if (nameToCompareWith.startsWith(input.slice(1).toLowerCase())) {
          this.searchUserResult.push(user);
        }
      } else if (nameToCompareWith.includes(input.toLowerCase())) {
        this.searchUserResult.push(user);
      }
    });
  }

  searchChannels(input: string) {
    this.searchChannelsResult = [];
    this.listOfAllChannels.forEach((channel) => {
      let channelToCompareWith = channel.name.toLowerCase();
      if (input.startsWith('#')) {
        if (channelToCompareWith.includes(input.slice(1).toLowerCase()))
          this.searchChannelsResult.push(channel);
      } else if (channelToCompareWith.includes(input.toLowerCase())) {
        this.searchChannelsResult.push(channel);
      }
    });
  }

  async loadAllMessages() {
    this.listOfAllChannels.forEach((channel) => {
      let channelId = channel.id;
      onSnapshot(this.getMessageRef('Channels', channelId), (msgList) => {
        let messages: Message[] = [];
        msgList.forEach((msg) => {
          const MESSAGE = new Message(
            this.messageService.getCleanMessageObj(msg.data()),
            msg.id
          );
          MESSAGE.messageOfChannel = channel.id;
          messages.push(MESSAGE);
        });
        this.listOfAllMessages = messages;
      });
    });
  }

  searchMessages(input: string) {
    this.loadAllMessages();
    this.searchMessageResult = [];
    this.listOfAllMessages.forEach((message) => {
      let messageToCompareWith = message.content.toLowerCase();
      if (messageToCompareWith.includes(input.toLowerCase())) {
        this.searchMessageResult.push(message);
      }
    });
  }

  async loadAllThreads() {
    let threads: Message[] = [];
    this.listOfAllMessages.forEach(async (message) => {
      let messageId = message.id;
      let channelId = message.messageOfChannel;
      await onSnapshot(
        collection(this.getThreadColRef(messageId, channelId), 'threads'),
        (messages) => {
          messages.forEach((thread) => {
            let msg = new Message(
              this.threadsService.getCleanMessageObj(thread.data()),
              message.id,
              message.messageOfChannel
            );
            threads.push(msg);
          });
          this.listOfAllThreads = threads;
        }
      );
    });
  }

  searchThreads(input: string) {
    this.loadAllThreads();
    this.searchThreadResult = [];
    this.listOfAllThreads.forEach((thread) => {
      let threadToCompareWith = thread.content.toLowerCase();
      if (threadToCompareWith.includes(input.toLowerCase())) {
        this.searchThreadResult.push(thread);
      }
    });
  }

  showChannelName(message: Message): string | undefined {
    const channelId = message.messageOfChannel;
    const foundChannel = this.listOfAllChannels.find(
      (channel) => channel.id === channelId
    );
    return foundChannel ? foundChannel.name : undefined;
  }

  getChannelColRef() {
    return collection(this.firebaseInitService.getDatabase(), 'Channels');
  }

  getChannelDocRef(messageId: string) {
    return doc(this.getChannelColRef(), messageId);
  }

  getChannelMessagesColRef(messageId: string) {
    return collection(this.getChannelDocRef(messageId), 'messages');
  }

  getThreadColRef(messageID: string, channelId: string) {
    return doc(this.getChannelMessagesColRef(channelId), messageID);
  }

  noResultFound() {
    if (
      this.searchChannelsResult.length === 0 &&
      this.searchUserResult.length === 0 &&
      this.searchMessageResult.length === 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  getMessageRef(colId: string, docId: string) {
    return collection(this.getSingleDocRef(colId, docId), 'messages');
  }

  getCollectionRef(colId: string) {
    return collection(this.firebaseInitService.getDatabase(), colId);
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(this.getCollectionRef(colId), docId);
  }

  async searchForChannel(message: Message) {
    let channelId = message.messageOfChannel;
    let messageId = message.id;
    await this.channelService.subChannel(channelId);
    this.threadsService.isShowingSig.set(true);
    setTimeout(() => {
      this.threadsService.getThread(messageId);
    }, 200);
  }
}
