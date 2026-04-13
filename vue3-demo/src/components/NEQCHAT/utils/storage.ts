class Storage {
  private static instace: Storage;
  private store = new Map();
  private type: "localStorage" | "memory" = "memory";
  private salt = "__yunxin_discord_app__";

  constructor(type?: "localStorage" | "memory") {
    if (type) {
      this.type = type;
    }
  }

  public get(key: string): any {
    let value;
    switch (this.type) {
      case "memory":
        return this.store.get(key);
      case "localStorage":
        value = localStorage.getItem(`${this.salt}${key}`);
        if (value) {
          return JSON.parse(value);
        }
        return value;
    }
  }

  public set(key: string, value: any) {
    switch (this.type) {
      case "memory":
        this.store.set(key, value);
        break;
      case "localStorage":
        localStorage.setItem(`${this.salt}${key}`, JSON.stringify(value));
        break;
    }
  }

  public remove(key: string) {
    switch (this.type) {
      case "memory":
        this.store.delete(key);
        break;
      case "localStorage":
        localStorage.removeItem(`${this.salt}${key}`);
        break;
    }
  }

  static getInstance(type?: "localStorage" | "memory") {
    if (!this.instace) {
      this.instace = new Storage(type);
    }
    return this.instace;
  }
}

export default Storage;

export const sessionIns = new Storage("localStorage");
export const localIns = new Storage("localStorage");
export const memoryIns = new Storage("memory");
