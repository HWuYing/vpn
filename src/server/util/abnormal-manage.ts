import { EventEmitter } from './event-emitter';
import { PackageSeparation } from './package-separation';
import { COMMUNICATION_EVENT } from '../constant';
import { ProxySocket } from '../net-util';

const { ERROR, END, CLOSE } = COMMUNICATION_EVENT;

export class AbnormalManage extends EventEmitter {
  private isNotEnd: boolean = true;
  constructor(private uid: string, private channel: ProxySocket, private packageSeparation: PackageSeparation) {
    super();
  }

  endCall = () => () => {
    console.log(`-- end listening ${this.uid} --`);
    if (this.isNotEnd) {
      this.packageSeparation.sendEventPackage(this.uid, END);
    }
  }

  closeCall = () => () => {
    console.log(`-- close listening ${this.uid} --`);
    if (this.isNotEnd) {
      this.packageSeparation.sendEventPackage(this.uid, CLOSE);
      this.emitAsync('end');
    }
  };

  errorCall = () => (error: Error) => {
    console.log(`-- error listening ${this.uid} --`);
    console.log(error);
    if (this.isNotEnd) {
      this.packageSeparation.sendEventPackage(this.uid, ERROR);
      this.emitAsync('end');
    }
  };

  send = () => (data: Buffer[]) => {
    data.forEach((buffer: Buffer) => this.channel.write(buffer));
  }

  message = () => ({ uid, data, type }: any) => {
    console.log(`--message ${['link', 'data', 'close', 'error', 'end'][type]} ${uid}--`);
    this.isNotEnd = false;
    if ([CLOSE, END, ERROR].includes(type)) {
      this.emitAsync('end');
    }
  }
}