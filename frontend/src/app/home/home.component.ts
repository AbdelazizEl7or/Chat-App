import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  NbDialogService,
  NbLayoutDirection,
  NbLayoutDirectionService,
  NbSidebarService,
  NbToastrService,
} from '@nebular/theme';
import Peer, { MediaConnection } from 'peerjs';
import { Socket, io } from "socket.io-client";
import * as _swal from 'sweetalert';
import * as $ from 'jquery';
import { SweetAlert } from 'sweetalert/typings/core';
import { Uploader, UploadWidgetConfig, UploadWidgetResult } from 'uploader';
//import { translate } from 'google-translate-api';
const swalAlert: SweetAlert = _swal as any;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [NbToastrService]
})
export class HomeComponent {
  window = window;
  tab: 'chat' | 'profile' | 'call' = 'chat';
  translRtl = {
    create: 'أضف',
    edit: 'تعديل',
    name: 'أسم',
    wait: 'أنتظر',
    group: 'مجموعة',
    logOut: 'تسجيل خروج',
    typeMsg: ' أكتب رسالة أو قم بسحب وإسقاط الملفات هنا',
    cannotAcc: 'لا يمكنك قراءة رسائل هذه المجموعة لأنك لست عضو فيها',
  };
  translLtr = {
    create: 'Create',
    edit: 'Edit',
    wait: 'Wait',
    group: 'Group',
    name: 'name',
    logOut: 'log Out',
    typeMsg: 'type Message or drag and drop files here!',
    cannotAcc: 'you can`t read this group messages you not in it !!',
  };
  ManSend: any = null
  transl = this.translLtr;
  show = true;
  index = 0;
  loading = false;
  usersStr = 'chat-All-users'
  callsStr = 'Call-All-users-All'
  ChatsStr = 'chats-All-Users-And-users-index'
  PORT = 'https://chat-cz51.onrender.com/';
  // PORT = 'http://localhost:6060/';
  postU = 'add/' + this.usersStr;
  getU = 'get/' + this.usersStr;
  users!: any;
  selMan!: any;
  messages: any[] = [];
  alertM: any = false;
  group = [];
  myGroup = [];
  groupOpen = false;
  groupeditOpen = false;
  rtl = false;
  peer!: any;
  callid = '';
  mediaRecorder!: MediaRecorder;
  @ViewChild('callout') callout!: TemplateRef<any>;
  opp(id: any, ii: HTMLElement) {
    ii.style.display = 'block';
    this.callid = id;
  }
  changeDirection() {
    this.rtl = !this.rtl;
    if (this.rtl) {
      this.transl = this.translRtl;
      this.NbLayoutDirectionService.setDirection(NbLayoutDirection.RTL);
      window.localStorage.setItem('USER_CHAT_INFO_RTL', 'RTL');
    } else {
      this.transl = this.translLtr;
      this.NbLayoutDirectionService.setDirection(NbLayoutDirection.LTR);
      window.localStorage.setItem('USER_CHAT_INFO_RTL', 'LTR');
    }
    this.reply();
  }
  onOpenAddGroup() {
    this.tab = 'chat'
    this.group.push(
      (this.users as []).find((e: any) => e.id == this.userData.id)!
    );
  }
  getActive(i: any) {
    return this.group.find((e: any) => e.id == this.users[i].id);
  }
  translMsg = false;
  addInGroup(n: number) {
    if (
      this.group.find((e: any) => e.id == ((this.users as [])[n] as any).id)
    ) {
      for (let i = 0; i < this.group.length; i++) {
        const element = this.group[i] as { id: string };
        if (element.id == ((this.users as [])[n] as any).id) {
          this.group.splice(i, 1);
        }
      }
    } else {
      this.group.push((this.users as [])[n]);
    }
    if (!this.group.find((e: any) => e._id == this.userData._id)) {
      this.group.push(this.users.find((e: any) => e._id == this.userData._id) as never)
    }
  }
  addG(name: any) {
    this.groupOpen = !this.groupOpen;
    if (!(this.users as []).find((e: any) => e.name == name)) {
      var chatId = '';
      for (let i = 0; i < this.group.length; i++) {
        const element: any = this.group[i];
        chatId = chatId + element._id
      }
      if (chatId == '') {
        chatId = crypto.randomUUID();
      }
      let data = {
        name: name,
        image:
          'https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/3x/external-chat-group-social-media-vitaliy-gorbachev-flat-vitaly-gorbachev.png',
        id: crypto.randomUUID(),
        users: this.group,
        addMan: this.userData._id,
        chatId: chatId,
        status: 'Group'
      };
      this.users.push(data);
      fetch(this.PORT + this.postU, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.log(error);
      });
    } else {
      swalAlert('Name is in other group');
    }
  }
  currentgroup: any
  editG(name: any) {
    this.groupeditOpen = false;
    if (!(this.users as []).find((e: any) => e.name == name && e._id != this.currentgroup._id)) {
      let data = {
        name: name,
        image: this.image || 'https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/3x/external-chat-group-social-media-vitaliy-gorbachev-flat-vitaly-gorbachev.png',
        users: this.group,
      };
      fetch(this.PORT + 'update/' + this.usersStr + '/' + this.currentgroup._id, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.log(error);
      })
      setTimeout(() => {
        fetch(this.PORT + 'emitAll/UsersChange', { method: 'post', body: this.userData._id, })
          .then((response) => response.json())
          .then((myData) => {
            this.clg(myData);
          });
      }, 1000);

    } else {
      swalAlert('Name is in other group');
    }
  }

  clg(e: any) {
    console.log(e);
  }
  sendMessage(event: any) {
    this.socket.emit('UserId', this.userData._id);
    const files = !event.files
      ? []
      : event.files.map((file: any) => {
        return {
          url: file.src,
          type: file.type,
          icon: 'file-text-outline',
        };
      });
    let data = {
      text: event.message,
      date: new Date(),
      reply: true,
      type: event.type ? event.type : files.length ? 'file' : 'text',
      files: files,
      user: {
        name: this.userData.name,
        avatar: this.userData.image,
        id: this.userData.id,
      },
    };
    data.reply = this.userData.id == data.user.id ? true : false;
    this.messages!.push(data);
    // this.reply();
    var msg = { chatId: this.selMan.chatId, id1: this.userData._id, id2: this.selMan._id, msg: data }
    this.socket.emit('chat', msg);
  }
  fUrl: any = false;
  sidebar = false;
  constructor(
    private router: Router,
    private sidebarService: NbSidebarService,
    private NbLayoutDirectionService: NbLayoutDirectionService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    private snack: NbToastrService,
    private dialogService: NbDialogService

  ) {
    if (!this.userData) {
      this.router.navigate(['login']);
    } else {
    }
  }

  url(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  userData = window.localStorage.getItem('USER_CHAT_INFO_DATA')
    ? JSON.parse(window.localStorage.getItem('USER_CHAT_INFO_DATA') as string)
    : null;

  editName() {
    let c = swalAlert(this.rtl ? 'الأسم الجديد' : 'Name to edit', {
      buttons: ['cancel', 'Ok'],
      content: { element: 'input', attributes: { value: this.userData.name } },
    }).then((value) => {
      if (value) {
        this.userData.name = value;
        fetch(this.PORT + 'update/' + this.usersStr + '/' + this.userData._id, {
          method: 'POST',
          body: JSON.stringify({ name: value }),
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        });
        window.localStorage.setItem(
          'USER_CHAT_INFO_DATA',
          JSON.stringify(this.userData)
        );
        setTimeout(() => {
          fetch(this.PORT + 'emitAll/UsersChange', { method: 'post', body: this.userData._id, })
            .then((response) => response.json())
            .then((myData) => {
              this.clg(myData);
            });
        }, 1000);
      }
    });
  }

  editGroup(id: string) {
    let c = (swalAlert as any)({
      title: 'Select What To do',
      buttons: { delete: "Delete", edit: "Edit", cancel: "Cancel" }
    }).then((value: any) => {
      if (value == "delete") {
        this.users.splice(this.users.findIndex((e: any) => e._id == id), 1);
        fetch(this.PORT + 'delete/' + this.usersStr + '/' + id, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        });
      }
      if (value == "edit") {
        this.currentgroup = this.users.find((e: any) => e._id == id);
        this.group = this.currentgroup.users;
        this.image = this.currentgroup.image;
        this.groupeditOpen = true;
        this.tab = 'chat';
        window.scrollTo(0, 0)
      }
    })
  }


  uploadedFileUrl: any = undefined;
  uploader = Uploader({
    apiKey: 'free',
  });
  options: UploadWidgetConfig = {
    multi: false,
  };
  image = '';
  onCompleteImage = (files: UploadWidgetResult[]) => {
    if (files[0]?.fileUrl)
      this.image = files[0]?.fileUrl
  };

  onComplete = (files: UploadWidgetResult[]) => {
    if (files[0]?.fileUrl) {
      this.uploadedFileUrl = files[0]?.fileUrl;
      this.userData.image = this.uploadedFileUrl;
      window.localStorage.setItem(
        'USER_CHAT_INFO_DATA',
        JSON.stringify(this.userData)
      );
      fetch(this.PORT + 'update/' + this.usersStr + '/' + this.userData._id, {
        method: 'POST',
        body: JSON.stringify({ image: this.uploadedFileUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.log(error);
      });
      setTimeout(() => {
        fetch(this.PORT + 'emitAll/UsersChange', { method: 'post', body: this.userData._id, })
          .then((response) => response.json())
          .then((myData) => {
            this.clg(myData);
          });
      }, 1000);
    }
  };
  omaijyopem = false
  updateSingleSelectGroupValue(value: any): void {
    this.userData.status = value[0];
    window.localStorage.setItem(
      'USER_CHAT_INFO_DATA',
      JSON.stringify(this.userData)
    );
    fetch(this.PORT + 'update/' + this.usersStr + '/' + this.userData._id, {
      method: 'POST',
      body: JSON.stringify({ status: value[0] }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      console.log(error);
    });
    //;
    this.cd.markForCheck();
  }
  deleteAcc() {
    let c = swalAlert(
      this.rtl
        ? 'هل أنت متأكد ؟ إذا تم حذف الحساب لن يمكنك الرجوع مره أخرى !! يمكنك تسجيل خروج فقط '
        : 'are you sure ? If the account is deleted, you will not be able to go back again!! You can only log out.',
      {
        buttons: ['cancel', 'Ok'],
      }
    ).then((value) => {
      if (value) {
        fetch(this.PORT + 'delete/' + this.usersStr + '/' + this.userData._id, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        });
        window.localStorage.setItem('USER_CHAT_INFO_DATA', '');
        this.router.navigate(['login']);
      }
    });
  }
  editpass() {
    let c = swalAlert(this.rtl ? 'كلمة السر الجديدة' : 'password to edit', {
      buttons: ['cancel', 'Ok'],
      content: {
        element: 'input',
        attributes: { value: this.userData.password },
      },
    }).then((value) => {
      if (value) {
        this.userData.password = value;
        fetch(this.PORT + 'update/' + this.usersStr + '/' + this.userData._id, {
          method: 'POST',
          body: JSON.stringify({ password: value }),
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        });
        window.localStorage.setItem(
          'USER_CHAT_INFO_DATA',
          JSON.stringify(this.userData)
        );

      }
    });
  }
  dtt() {
    this.cd.detectChanges()
  }
  toggle() {
    this.sidebar = !this.sidebar;
    this.sidebarService.toggle();
  }
  openOne(i: number) {
    this.loading = true;
    this.dtt();
    this.tab = 'chat'
    this.socket.emit('UserId', this.userData._id);
    //this.toggle();
    if (
      !this.users.find((e: any) => e.id == this.users[i].id).users ||
      this.users
        .find((e: any) => e.id == this.users[i].id)
        .users.find((e: any) => e.id == this.userData.id) ||
      this.users.find((e: any) => e.id == this.users[i].id).users.length === 0
    ) {
      this.index = i;
      this.selMan = this.users.find((e: any) => e.id == this.users[i].id);
      if (!this.selMan.users) {
        if (this.selMan.id != this.userData.id) {
          fetch(this.PORT + 'get/' + this.ChatsStr, {
            method: 'GET',
          })
            .then((response) => response.json())
            .then((myData) => {
              var chatid = ''
              if (myData.find((e: any) => e.id == this.userData._id && e.id2 == this.selMan._id) || myData.find((e: any) => e.id2 == this.userData._id && e.id == this.selMan._id)) {
                var chttt = myData.find((e: any) => e.id == this.userData._id && e.id2 == this.selMan._id) || myData.find((e: any) => e.id2 == this.userData._id && e.id == this.selMan._id)
                chatid = chttt.chatid
                this.selMan.chatId = chatid + 'one';
                console.log(this.selMan.chatId);
                fetch(this.PORT + 'get/' + this.selMan.chatId, {
                  method: 'GET',
                })
                  .then((response) => response.json())
                  .then((myData) => {
                    this.messages = [];
                    this.messages = myData;
                    this.reply();
                    setTimeout(() => {
                      this.loading = false;
                    }, 0);
                    this.dtt();

                  });
              } else {
                this.index = i;
                this.selMan = this.users.find((e: any) => e.id == this.users[i].id);
                this.selMan.chatId = this.userData._id + this.users.find((e: any) => e.id == this.users[i].id)._id + 'one'

                fetch(this.PORT + 'get/' + this.selMan.chatId, {
                  method: 'GET',
                })
                  .then((response) => response.json())
                  .then((myData) => {
                    this.messages = [];
                    this.messages = myData;
                    this.reply();
                    setTimeout(() => {
                      this.loading = false;
                    }, 0);
                    this.dtt();
                  });
                fetch(this.PORT + 'add/' + this.ChatsStr, {
                  method: 'POST',
                  body: JSON.stringify({ chatid: this.userData._id + this.users.find((e: any) => e.id == this.users[i].id)._id, id: this.userData._id, id2: this.users.find((e: any) => e.id == this.users[i].id)._id }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }).catch((error) => {

                });
              }
            });

        } else {
          this.selMan.chatId = this.userData._id + '-AllYou';

          fetch(this.PORT + 'get/' + this.selMan.chatId, {
            method: 'GET',
          })
            .then((response) => response.json())
            .then((myData) => {
              this.messages = [];
              this.messages = myData;
              this.reply();
              setTimeout(() => {
                this.loading = false;
              }, 0);
              this.dtt();

            });
        }
      } else {
        this.selMan.chatId = this.selMan.chatId + '-group';

        fetch(this.PORT + 'get/' + this.selMan.chatId, {
          method: 'GET',
        })
          .then((response) => response.json())
          .then((myData) => {
            this.messages = [];
            this.messages = myData;
            this.reply();
            setTimeout(() => {
              this.loading = false;
            }, 0);
            this.dtt();

          });
      }

    } else {
      if (
        !this.users
          .find((e: any) => e.id == this.users[i].id)
          .users.find((e: any) => e.id == this.userData.id)
      ) {
        swalAlert(this.transl.cannotAcc);
      }
    }
  }
  logOut() {
    let c = swalAlert(
      this.rtl ? 'هل أنت متأكد (تسجيل خروج)' : 'are you sure (log Out)',
      {
        buttons: ['no', 'Ok'],
      }
    ).then((value) => {
      if (value) {
        this.socket.disconnect();
        window.localStorage.setItem('USER_CHAT_INFO_DATA', '');
        this.router.navigate(['login']);
      }
    });
  }
  socket!: Socket;
  caller: any;
  peerdd!: Peer;
  call!: MediaConnection;
  calling!: boolean;
  answrd: boolean = false;
  closed = false;
  adduio: any
  ngOnInit(): void {
    if (!this.userData) {
      this.router.navigate(['login']);
    } else {
      setTimeout(() => {
        var ii = document.createElement('div');
        ii.innerHTML = '<emoji-picker class="dark"></emoji-picker>'
        document.getElementById('emojy')!.appendChild(ii);
        document.querySelector('emoji-picker')!
          .addEventListener('emoji-click', (event: any) => {
            this.sendMessage({ message: event.detail.unicode, files: [] });
          });
      }, 100);
      this.loading = true;
      if (window.localStorage.getItem('USER_CHAT_INFO_RTL')! == 'RTL') {
        this.rtl = true;
        this.transl = this.translRtl;
        this.NbLayoutDirectionService.setDirection(NbLayoutDirection.RTL);
      } else {
        this.rtl = false;
        this.transl = this.translLtr;
        this.NbLayoutDirectionService.setDirection(NbLayoutDirection.LTR);
      }
      if (!this.userData) {
        this.router.navigate(['login']);
      }
      this.peerdd = new Peer(this.userData._id,);
      window.navigator.mediaDevices.getUserMedia
        ({ video: false, audio: true }).then(stream => {
          this.peerdd.on('call', (call) => {
            setTimeout(() => {
              var a = new Audio();
              a.id = 'HeAudio';
              a.srcObject = call.localStream
              a.controls = true;
              a.onloadedmetadata = (e) => {
                a.play();
              };
              this.adduio = a;
            }, 1000);

            this.call = call;
            this.caller = this.users.find((e: any) => e._id == call.peer);
            setTimeout(() => {
              document.body.style.overflow = 'auto';
              document.body.style.padding = '0';
              document.getElementById('callin')?.click();
              if (document.getElementsByClassName('modal-backdrop')[0]) {
                document.getElementsByClassName('modal-backdrop')[0].remove()
              }
            }, 200);
          });
        }).catch((e) => {
          if(e ="NotFoundError: Requested device not found")
            this.clg("Sorry but you don\'t have a microphone.")
            else
          swalAlert({ icon: 'error', dangerMode: true, title: 'Open the microphone for us so we can send your voice.' })
        });
      this.socket = io(this.PORT);
      var scot = this.socket.connect();
      scot.id = this.userData._id;
      this.socket.emit('UserId', this.userData._id);
      this.socket.on('closeCall', (id) => {
        console.log('close')
        if (this.answrd) {
          document.body.style.overflow = 'auto';
          document.body.style.padding = '0';
          document.getElementById('HeAudio')?.remove();
          document.getElementById('meAudio')?.remove();
          document.getElementById('closeinme')?.click();
          this.calling = false;
          this.answrd = false;
          this.closed = false;
        }
        if (this.callingMa && !this.answrd)
          this.closed = true;
        if (this.caller) {
          document.body.style.overflow = 'auto';
          document.body.style.padding = '0';
          document.getElementById('callincloase')?.click();
          this.caller = null;
          this.startCall = false;
          // this.answrd = false;
        }

      });
      this.socket.on('chat', (msg) => {
        console.log('msg')
        console.log(msg)
        if (msg) {
          if (this.selMan.chatId == msg.chatId) {
            this.get(this.selMan.chatId);
          }
          else {
            if (msg.id1 == this.userData._id) {
              setTimeout(() => {
                this.ManSend = null
              }, 5000);
              this.ManSend = { name: this.users.find((e: any) => e._id == msg.id2).name, text: msg.msg.text.slice(0, 20), id: this.users.findIndex((e: any) => e._id == msg.id2) }
            }
            if (msg.id2 == this.userData._id) {
              setTimeout(() => {
                this.ManSend = null
              }, 5000);
              this.ManSend = { name: this.users.find((e: any) => e._id == msg.id1).name, text: msg.msg.text.slice(0, 20), id: this.users.findIndex((e: any) => e._id == msg.id1) }
            }
          }
        } else
          this.openOne(this.index);
      })
      this.socket.on('UsersChange', (id) => {
        fetch(this.PORT + this.getU, { method: 'GET' })
          .then((response) => response.json())
          .then((myData) => {
            myData = myData.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            if (JSON.stringify(this.users) !== JSON.stringify(myData)) {
              if (JSON.stringify(this.users[this.index]) != JSON.stringify(myData[this.index])) {
                this.users = myData.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                let me =  this.users.splice(this.users.findIndex((e:any)=>e.id == this.userData.id),1)
                this.users.unshift(me[0]);
                this.selMan = this.users.find((e: any) => e.id == this.users[this.index].id);
                if (!this.selMan.users) {
                  if (this.selMan.id != this.userData.id) {
                    fetch(this.PORT + 'get/' + this.ChatsStr, {
                      method: 'GET',
                    })
                      .then((response) => response.json())
                      .then((myData) => {
                        var chatid = ''
                        if (myData.find((e: any) => e.id == this.userData._id && e.id2 == this.selMan._id) || myData.find((e: any) => e.id2 == this.userData._id && e.id == this.selMan._id)) {
                          var chttt = myData.find((e: any) => e.id == this.userData._id && e.id2 == this.selMan._id) || myData.find((e: any) => e.id2 == this.userData._id && e.id == this.selMan._id)
                          chatid = chttt.chatid
                          this.selMan.chatId = chatid + 'one';
                        } else {
                          this.selMan = this.users.find((e: any) => e.id == this.users[this.index].id);
                          this.selMan.chatId = this.userData._id + this.users.find((e: any) => e.id == this.users[this.index].id)._id + 'one'

                        }
                      });

                  } else {
                    this.selMan.chatId = this.userData._id + '-AllYou';

                  }
                } else {
                  this.selMan.chatId = this.selMan.chatId + '-group';

                }
              }
              else {
                this.users = myData.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                let me =  this.users.splice(this.users.findIndex((e:any)=>e.id == this.userData.id),1)
                this.users.unshift(me[0]);
              }
            }
            //document.getElementById(id)?.classList.add('animate__animated animate__flash')
          })
      })
      fetch(this.PORT + this.getU, { method: 'GET' })
        .then((response) => response.json())
        .then((myData) => {
          console.log(myData)
          if (!this.userData) {
            this.router.navigate(['login']);
          }
          this.users = myData.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));;
          let me =  this.users.splice(this.users.findIndex((e:any)=>e.id == this.userData.id),1)
          this.users.unshift(me[0]);
          this.index = 0;
          this.myGroup.push(this.userData as never);
          this.index = this.index <= this.users.findIndex((e: any) => e._id == this.userData._id) ? 0 : 0;
          this.openOne(this.index <= 0 ? 0 : this.index);
          this.toggle();
        });

    }
  }
  isHaveGroups(){
    return this.users.filter((user:any)=> user.addMan == this.userData._id).length != 0
  }
  get(id: any) {
    fetch(this.PORT + 'get/' + id, { method: 'GET' })
      .then((response) => response.json())
      .then((myData) => {
        if (this.messages.length < myData.length) {
          let tran = document.createElement('audio');
          tran.src = '../../assets/Windows Logon Sound.wav';
          document.body.append(tran);
          tran.play();
          this.messages = myData;
          this.reply();
        }
      });
  }
  reply() {
    if (this.translMsg) {
      this.show = false;
    }
    this.messages.map(async (e: any) => {
      e.reply = this.userData.id == e.user.id ? true : false;
    });
  }
  formatDate(dateVal: Date) {
    var newDate = new Date(dateVal);

    var sMonth = this.padValue(newDate.getMonth() + 1);
    var sDay = this.padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour: any = newDate.getHours();
    var sMinute = this.padValue(newDate.getMinutes());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);

    if (iHourCheck > 12) {
      sAMPM = "PM";
      sHour = iHourCheck - 12;
    }
    else if (iHourCheck === 0) {
      sHour = "12";
    }

    sHour = this.padValue(sHour);

    return sMonth + "-" + sDay + "-" + sYear + " " + sHour + ":" + sMinute + " " + sAMPM;
  }

  padValue(value: number) {
    return (value < 10) ? "0" + value : value;
  }
  recordstartet = false
  timeinterval: any = 1
  timer = '00:00'
  times = 0
  timeD = 0
  recordedUrl = ''
  rocloading = false
  recordVoice() {
    if (!this.recordstartet && !this.recordedUrl)
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.start();
            this.recordstartet = true;
            let chunks: any[] = [];
            this.timeinterval = setInterval(() => {
              this.times++
              if (this.times == 60) {
                this.times = 0
                this.timeD++
              }
              this.timer = ((this.timeD.toString().length == 1 ? '0' : '') + this.timeD) + ":" + ((this.times.toString().length == 1 ? '0' : '') + this.times)
            }, 1000)
            this.mediaRecorder.onstop = (e) => {
              clearInterval(this.timeinterval)
              this.times = 0;
              this.timeD = 0;
              this.timer = '00:00';
              const blob = new Blob(chunks, {
                type: "audio/ogg;  codecs=opus"
              });
              var reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                var base64data = reader.result;
                this.recordedUrl = base64data!.toString();
                this.cd.detectChanges();
                return;
              };

              chunks = [];
            };
            this.mediaRecorder.ondataavailable = (e) => {
              chunks.push(e.data);
            };
          }).catch((e) => {
            if(e ="NotFoundError: Requested device not found")
              swalAlert({ icon: 'error', dangerMode: true, title: 'Sorry but you don\'t have a microphone.' })
              else
            swalAlert({ icon: 'error', dangerMode: true, title: 'Open the microphone for us so we can send your voice.' })
          });
      }
  }

  stoprecord() {
    this.recordstartet = false;
    this.mediaRecorder.stop();
  }

  sendRecord() {
    this.sendMessage({ text: '', type: 'audio', audio: true, files: [{ src: this.recordedUrl, type: 'audio/ogg;  codecs=opus' }] })
    this.recordedUrl = '';
  }
  closer() {
    this.rocloading = false;
    this.cd.detectChanges()
  }
  leftpos: any = null
  topPos: any = null
  deleteMsg(id: string) {
    let c = swalAlert(
      this.rtl
        ? ' هل أنت متأكد ؟ حذف هذه الرسالة '
        : 'are you sure ? delete this message ',
      {
        buttons: ['cancel', 'Ok'],
      }
    ).then((value) => {
      if (value) {
        this.messages.splice(this.messages.findIndex(e => e._id == id), 1);
        fetch(this.PORT + 'delete/' + this.selMan.chatId + '/' + id, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        });
        fetch(this.PORT + 'emitAll/chat', {
          method: 'POST'
        }).catch((error) => {

        });
      }
    })
  }
  startCall!: boolean;
  inCall: boolean = false
  callingMa: any
  Call(id: string) {
    window.navigator.mediaDevices.getUserMedia
      ({ video: false, audio: true }).then(stream => {
        this.startCall = true;
        this.closed = false;
        this.callingMa = this.users.find((e: any) => e._id == id);
        var call = this.peerdd.call(id, stream, { metadata: this.userData._id });
        setTimeout(() => {
          document.body.style.overflow = 'auto';
          document.body.style.padding = '0';
          document.getElementById('callout')?.click();
          if (document.getElementsByClassName('modal-backdrop')[0]) {
            document.getElementsByClassName('modal-backdrop')[0].remove()
          }
        }, 200);
        call.on('stream', (remoteStream) => {
          this.answrd = true;
          this.inCall = true;
          setTimeout(() => {
            document.body.style.overflow = 'auto';
            document.body.style.padding = '0';
            document.getElementById('incallMe')?.click();
            if (document.getElementsByClassName('modal-backdrop')[0]) {
              document.getElementsByClassName('modal-backdrop')[0].remove()
            }
          }, 200);
          setTimeout(() => {
            var a = new Audio();
            a.id = 'meAudio';
            a.srcObject = remoteStream
            a.controls = true;
            a.onloadedmetadata = (e) => {
              a.play();
            };
          }, 1000);
        });
      }).catch((e) => {
        if(e ="NotFoundError: Requested device not found")
          swalAlert({ icon: 'error', dangerMode: true, title: 'Sorry but you don\'t have a microphone.' })
          else
        swalAlert({ icon: 'error', dangerMode: true, title: 'Open the microphone for us so we can send your voice.' })
      });
  }
  answr() {
    window.navigator.mediaDevices.getUserMedia
      ({ video: false, audio: true }).then(stream => {
        this.inCall = true;
        this.startCall = true;
        this.answrd = true;
        this.call.answer(stream);
        setTimeout(() => {
          document.body.style.overflow = 'auto';
          document.body.style.padding = '0';
          document.getElementById('incallMe')?.click();
          if (document.getElementsByClassName('modal-backdrop')[0]) {
            document.getElementsByClassName('modal-backdrop')[0].remove()
          }
        }, 200);
      }).catch((e) => {
        if(e ="NotFoundError: Requested device not found")
          swalAlert({ icon: 'error', dangerMode: true, title: 'Sorry but you don\'t have a microphone.' })
          else
        swalAlert({ icon: 'error', dangerMode: true, title: 'Open the microphone for us so we can send your voice.' })
      });
  }
  close() {
    this.inCall = false;
    this.startCall = false;
    fetch(this.PORT + 'emitAll/closeCall', {
      method: 'POST'
    }).catch((error) => {

    });
  }
}
