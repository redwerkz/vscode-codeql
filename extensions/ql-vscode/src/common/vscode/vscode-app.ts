import * as vscode from "vscode";
import { Disposable } from "../../pure/disposable-object";
import { App, AppMode } from "../app";
import { AppEventEmitter } from "../events";
import { extLogger, Logger } from "../logging";
import { Memento } from "../memento";
import { VSCodeAppEventEmitter } from "./events";

export class ExtensionApp implements App {
  public constructor(
    public readonly extensionContext: vscode.ExtensionContext,
  ) {}

  public get extensionPath(): string {
    return this.extensionContext.extensionPath;
  }

  public get globalStoragePath(): string {
    return this.extensionContext.globalStorageUri.fsPath;
  }

  public get workspaceStoragePath(): string | undefined {
    return this.extensionContext.storageUri?.fsPath;
  }

  public get workspaceState(): Memento {
    return this.extensionContext.workspaceState;
  }

  public get subscriptions(): Disposable[] {
    return this.extensionContext.subscriptions;
  }

  public get mode(): AppMode {
    switch (this.extensionContext.extensionMode) {
      case vscode.ExtensionMode.Development:
        return AppMode.Development;
      case vscode.ExtensionMode.Test:
        return AppMode.Test;
      default:
        return AppMode.Production;
    }
  }

  public get logger(): Logger {
    return extLogger;
  }

  public createEventEmitter<T>(): AppEventEmitter<T> {
    return new VSCodeAppEventEmitter<T>();
  }

  public executeCommand(command: string, ...args: any): Thenable<void> {
    return vscode.commands.executeCommand(command, ...args);
  }
}
