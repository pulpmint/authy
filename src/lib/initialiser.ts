import Prisma from "@/lib/prisma";
import Redis from "@/lib/redis";

export default class Initialiser {
  private services: Array<string> = ["MongoDB", "Redis"];

  private onSuccess = () => {
    console.log("✅ Service initialised:", this.services[0]);
    this.services.shift();
  };

  public init = () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await Prisma.$connect();
        this.onSuccess();

        await Redis.ping();
        this.onSuccess();

        console.log("✨ All services initialised");
        resolve();
      } catch (error) {
        console.log(error);
        console.log("💀 Error initialising:", this.services[0]);
        reject();
      }
    });
  };
}
