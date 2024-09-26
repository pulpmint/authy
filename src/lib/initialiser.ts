import Prisma from "@/lib/prisma";

export default class Initialiser {
  private services: Array<string> = ["MongoDB"];

  private onSuccess = () => {
    console.log("🤘 Service initialised:", this.services[0]);
    this.services.shift();
  };

  public init = () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await Prisma.$connect();
        this.onSuccess();

        console.log("✨ All services initialised");
        resolve();
      } catch (err) {
        console.log(err);

        console.log("💀 Error initialising:", this.services[0]);
        reject();
      }
    });
  };
}
