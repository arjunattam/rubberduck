// For reference: https://github.com/Microsoft/vscode/blob/master/extensions/typescript-language-features/src/tsServer/callbackMap.ts

interface CallbackItem {
  onSuccess: any;
  onError: any;
}

export class CallbackMap {
  private callbacks = new Map<string, CallbackItem>();

  public add(sequence: string, callback: CallbackItem) {
    this.callbacks.set(sequence, callback);
  }

  public fetch(sequence: string) {
    const callback = this.callbacks.get(sequence);
    this.delete(sequence);
    return callback;
  }

  private delete(sequence: string) {
    this.callbacks.delete(sequence);
  }
}
