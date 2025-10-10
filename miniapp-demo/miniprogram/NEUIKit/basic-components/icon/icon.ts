// 图标资源映射 - 使用网络CDN链接减少包大小
const urlMap: Record<string, string> = {
  "icon-a-1": "https://yx-web-nosdn.netease.im/common/7c2e2c6ff08f4ed60f3ca7d5ab6d38ac/icon-a-1.png",
  "icon-a-2": "https://yx-web-nosdn.netease.im/common/bb61c05013350e980b3acf77a00aa7b7/icon-a-2.png",
  "icon-a-3": "https://yx-web-nosdn.netease.im/common/bfe80222635ec3f07e41b2819d002a4c/icon-a-3.png",
  "icon-a-4": "https://yx-web-nosdn.netease.im/common/e6dd252af94a4716edc191f7d3812042/icon-a-4.png",
  "icon-a-5": "https://yx-web-nosdn.netease.im/common/4e01e93f3e795d8aeb140e924d8b1206/icon-a-5.png",
  "icon-a-6": "https://yx-web-nosdn.netease.im/common/a1fa1174a588a984845ba871b1f1e3b0/icon-a-6.png",
  "icon-a-7": "https://yx-web-nosdn.netease.im/common/e0e30470561cf90446ec31c6d5b206a5/icon-a-7.png",
  "icon-a-8": "https://yx-web-nosdn.netease.im/common/e44ceea2c764bfbe773e61483ae857eb/icon-a-8.png",
  "icon-a-9": "https://yx-web-nosdn.netease.im/common/f4e5b303cb77d9ce67a0baf4efaa1125/icon-a-9.png",
  "icon-a-10": "https://yx-web-nosdn.netease.im/common/28e46e6cc468c4ff6f44532bd6b7f464/icon-a-10.png",
  "icon-a-11": "https://yx-web-nosdn.netease.im/common/f265ea5a782cebabae08a079045caf2c/icon-a-11.png",
  "icon-a-12": "https://yx-web-nosdn.netease.im/common/20043e6f8d619ab7bca69f1a0d5a0e56/icon-a-12.png",
  "icon-a-13": "https://yx-web-nosdn.netease.im/common/c2b2d52a97eea83efb10c9bbc34dc104/icon-a-13.png",
  "icon-a-14": "https://yx-web-nosdn.netease.im/common/37486551a8bd31e3446ae862cddd3067/icon-a-14.png",
  "icon-a-15": "https://yx-web-nosdn.netease.im/common/e383cc57dcb7a903887031ed0d341fef/icon-a-15.png",
  "icon-a-16": "https://yx-web-nosdn.netease.im/common/73e2f9507f8aac7238896a3f1ee8305a/icon-a-16.png",
  "icon-a-17": "https://yx-web-nosdn.netease.im/common/51a80e8e81a8aa531d1c68e6f79f7d58/icon-a-17.png",
  "icon-a-18": "https://yx-web-nosdn.netease.im/common/20f8c6153ba0f51c038e04f2fbedf767/icon-a-18.png",
  "icon-a-19": "https://yx-web-nosdn.netease.im/common/47d420b5251ca7b9ddc564b42564eb01/icon-a-19.png",
  "icon-a-20": "https://yx-web-nosdn.netease.im/common/8fad6b9427b49f5bfd1a8ec0f8a77fac/icon-a-20.png",
  "icon-a-21": "https://yx-web-nosdn.netease.im/common/6fa17035135cebe4ca1512b454fa38c2/icon-a-21.png",
  "icon-a-22": "https://yx-web-nosdn.netease.im/common/12189563eea22258b847cf900dcbc4d4/icon-a-22.png",
  "icon-a-23": "https://yx-web-nosdn.netease.im/common/3b7dcfe14788bd7d8c2da8aad6c24baa/icon-a-23.png",
  "icon-a-24": "https://yx-web-nosdn.netease.im/common/6bb0879272c8a3c73524f3b728a93c10/icon-a-24.png",
  "icon-a-25": "https://yx-web-nosdn.netease.im/common/1f93dac2bdef1f91ca2f7302065954d5/icon-a-25.png",
  "icon-a-26": "https://yx-web-nosdn.netease.im/common/aa3c8e63ee6c6d605f4606a8094f2094/icon-a-26.png",
  "icon-a-27": "https://yx-web-nosdn.netease.im/common/000447b3172d70d1b739a170c377eae2/icon-a-27.png",
  "icon-a-28": "https://yx-web-nosdn.netease.im/common/27c3b8d1acb6f234a7591c2358b549bf/icon-a-28.png",
  "icon-a-29": "https://yx-web-nosdn.netease.im/common/fbae68926f43367022d0b0c95c15adcf/icon-a-29.png",
  "icon-a-30": "https://yx-web-nosdn.netease.im/common/61c0b6c12bc6ad2b7e0511d843b03265/icon-a-30.png",
  "icon-a-31": "https://yx-web-nosdn.netease.im/common/202e7abeaecf651f6da3f7f695ef8752/icon-a-31.png",
  "icon-a-32": "https://yx-web-nosdn.netease.im/common/6ef4958d39866165212c1b60bc7c6a55/icon-a-32.png",
  "icon-a-33": "https://yx-web-nosdn.netease.im/common/18f8b53d57a6b47c3876b6938f2f57b9/icon-a-33.png",
  "icon-a-34": "https://yx-web-nosdn.netease.im/common/84d7491e6d5a6d53848b6a3d12a739b2/icon-a-34.png",
  "icon-a-35": "https://yx-web-nosdn.netease.im/common/f03fe01986e9e25f3faf1a17c0ef78c8/icon-a-35.png",
  "icon-a-36": "https://yx-web-nosdn.netease.im/common/4617253245617bcd38ed7165bdb592d8/icon-a-36.png",
  "icon-a-37": "https://yx-web-nosdn.netease.im/common/9168b11333f59b0ff948003dedb24c84/icon-a-37.png",
  "icon-a-38": "https://yx-web-nosdn.netease.im/common/1a3cd5d62e92895dbab3d356112b5079/icon-a-38.png",
  "icon-a-39": "https://yx-web-nosdn.netease.im/common/b465db737c737ab4308c9272a00a1fdf/icon-a-39.png",
  "icon-a-40": "https://yx-web-nosdn.netease.im/common/6bca766a4904e10934ea2f2450c341b5/icon-a-40.png",
  "icon-a-41": "https://yx-web-nosdn.netease.im/common/12d5055618b619b568342f0619cacf0c/icon-a-41.png",
  "icon-a-42": "https://yx-web-nosdn.netease.im/common/8851ccd815375180bd7f8728ead1cdf1/icon-a-42.png",
  "icon-a-43": "https://yx-web-nosdn.netease.im/common/1ac7cacc9d0063d165f8e2bc3020bfff/icon-a-43.png",
  "icon-a-44": "https://yx-web-nosdn.netease.im/common/5735260c7e240beaabc360365e6d60c5/icon-a-44.png",
  "icon-a-45": "https://yx-web-nosdn.netease.im/common/07372c06915a7d0a977a4f042522e2a7/icon-a-45.png",
  "icon-a-46": "https://yx-web-nosdn.netease.im/common/40c5b2b5769166b51c968942f4abed95/icon-a-46.png",
  "icon-a-47": "https://yx-web-nosdn.netease.im/common/9334c3ec8c8d54a9a3271a3536ff7c62/icon-a-47.png",
  "icon-a-48": "https://yx-web-nosdn.netease.im/common/5630ab646533dd6de7e3c1accc3d2ca1/icon-a-48.png",
  "icon-a-49": "https://yx-web-nosdn.netease.im/common/f2412538fa0da38549c23fd44b25bdfb/icon-a-49.png",
  "icon-a-50": "https://yx-web-nosdn.netease.im/common/1f28ffd1413aa3fcce1c17aff3694d41/icon-a-50.png",
  "icon-a-51": "https://yx-web-nosdn.netease.im/common/a99b57b586a85c23cbd8ed65d1a16765/icon-a-51.png",
  "icon-a-52": "https://yx-web-nosdn.netease.im/common/ce6f64bbe45a42108fd1b1a7b1dae606/icon-a-52.png",
  "icon-a-53": "https://yx-web-nosdn.netease.im/common/ba5dc56bf8f550da8c2dc1c94e2ee7fb/icon-a-53.png",
  "icon-a-54": "https://yx-web-nosdn.netease.im/common/81f5b3b693d9133030c013f0f21462ab/icon-a-54.png",
  "icon-a-55": "https://yx-web-nosdn.netease.im/common/758ed38dea207d60855969689a5dd68b/icon-a-55.png",
  "icon-a-56": "https://yx-web-nosdn.netease.im/common/a20bee2372cbe399191af3d76a5aad31/icon-a-56.png",
  "icon-a-57": "https://yx-web-nosdn.netease.im/common/a17fbdbc64cf4b55be377f18ed81879a/icon-a-57.png",
  "icon-a-58": "https://yx-web-nosdn.netease.im/common/784b31cda55da76d8278a5bd53c2c7e4/icon-a-58.png",
  "icon-a-59": "https://yx-web-nosdn.netease.im/common/c716afbc25b8809dfb9ca80a09051f6f/icon-a-59.png",
  "icon-a-60": "https://yx-web-nosdn.netease.im/common/54de44be20c5d21ffad08176b24560a0/icon-a-60.png",
  "icon-a-61": "https://yx-web-nosdn.netease.im/common/0628fd4507e2a3455028f376d8d5d80a/icon-a-61.png",
  "icon-a-62": "https://yx-web-nosdn.netease.im/common/fa336dc373d5e395a1e9a541dc9953d2/icon-a-62.png",
  "icon-a-63": "https://yx-web-nosdn.netease.im/common/868ee8c664b32b34d554d02fc406ab70/icon-a-63.png",
  "icon-a-64": "https://yx-web-nosdn.netease.im/common/4e33aadf3ca3b918e73ef07e21eb96ac/icon-a-64.png",
  "icon-a-65": "https://yx-web-nosdn.netease.im/common/c6e5563811d94c82426036b9f96d6de5/icon-a-65.png",
  "icon-a-66": "https://yx-web-nosdn.netease.im/common/8baa1f43b4e523e524c54f3340ef21cb/icon-a-66.png",
  "icon-a-67": "https://yx-web-nosdn.netease.im/common/307c3426dccf1252b5967956bcdcf58a/icon-a-67.png",
  "icon-a-68": "https://yx-web-nosdn.netease.im/common/196f62aa8e8a38bbbcd818ad42729714/icon-a-68.png",
  "icon-a-70": "https://yx-web-nosdn.netease.im/common/fb54482390faf9d8d9d607d7e3ab691f/icon-a-70.png",
  "icon-a-Frame7": "https://yx-web-nosdn.netease.im/common/c5c3d0ee0a4000736827cedfd0610172/icon-a-Frame7.png",
  "icon-a-Frame8": "https://yx-web-nosdn.netease.im/common/9f77f834a99c29ed5c4b4b54b7ade468/icon-a-Frame8.png",
  "icon-addition": "https://yx-web-nosdn.netease.im/common/6302fcf17e9c4ac65b392553aaccf9b1/icon-addition.png",
  "icon-biaoqing": "https://yx-web-nosdn.netease.im/common/1a98df356ed629193e50bea570e02a53/icon-biaoqing.png",
  "icon-chehui": "https://yx-web-nosdn.netease.im/common/958cb6797f69bdfbf5441da25ed997c3/icon-chehui.png",
  "icon-chuangjianqunzu": "https://yx-web-nosdn.netease.im/common/7b00839704359b7c10f32af7cc8b5911/icon-chuangjianqunzu.png",
  "icon-computed": "https://yx-web-nosdn.netease.im/common/352cd94c93347f01936b50bb1487b5a4/icon-computed.png",
  "icon-erfenzhiyiyidu": "https://yx-web-nosdn.netease.im/common/aa6b529567ee6aeb801f34f228600b04/icon-erfenzhiyiyidu.png",
  "icon-Excel": "https://yx-web-nosdn.netease.im/common/a9793bbb8a7237e9e92f57ad1b469baf/icon-Excel.png",
  "icon-fasong": "https://yx-web-nosdn.netease.im/common/f8d855dde4840989b4c88e904e1c23bf/icon-fasong.png",
  "icon-fuzhi1": "https://yx-web-nosdn.netease.im/common/9e0ba675eb4548bffe19da823fb712e3/icon-fuzhi1.png",
  "icon-guanbi": "https://yx-web-nosdn.netease.im/common/2d07f146ecb4b616632f0fcfdd02b5be/icon-guanbi.png",
  "icon-guanyu": "https://yx-web-nosdn.netease.im/common/24d2344c49b551d5a605b3e5e3e6f6da/icon-guanyu.png",
  "icon-huifu": "https://yx-web-nosdn.netease.im/common/153c273cb7b075fc0c37487655c5cbfc/icon-huifu.png",
  "icon-im-xuanzhong": "https://yx-web-nosdn.netease.im/common/468aaecf148e23c84b821835021dfee1/icon-im-xuanzhong.png",
  "icon-jiantou": "https://yx-web-nosdn.netease.im/common/c9bb28670c41e208b1d9bcedd6de88a1/icon-jiantou.png",
  "icon-jiaruqunzu": "https://yx-web-nosdn.netease.im/common/a27ba47b93131b7c52d829b7012fa966/icon-jiaruqunzu.png",
  "icon-kefu": "https://yx-web-nosdn.netease.im/common/4ddc1b9557e6672b0b45fb8fb992c992/icon-kefu.png",
  "icon-lahei": "https://yx-web-nosdn.netease.im/common/e9054279ca62db944ef6e5a76687a93a/icon-lahei.png",
  "icon-lishixiaoxi": "https://yx-web-nosdn.netease.im/common/77888d982110f3c709a3ff4fd24d48dd/icon-lishixiaoxi.png",
  "icon-More": "https://yx-web-nosdn.netease.im/common/137ad07f3245dc220d5546433db63786/icon-More.png",
  "icon-PPT": "https://yx-web-nosdn.netease.im/common/1991f8d57d1d432fcd930e4049403958/icon-PPT.png",
  "icon-qita": "https://yx-web-nosdn.netease.im/common/c6f687c792ef029bef1e59ccce986922/icon-qita.png",
  "icon-quxiaoxiaoximiandarao": "https://yx-web-nosdn.netease.im/common/f6f54973789b69939c57ae94a38e8d25/icon-quxiaoxiaoximiandarao.png",
  "icon-quxiaozhiding": "https://yx-web-nosdn.netease.im/common/ad2d451e8f1ee36ec9cec6787d6074c0/icon-quxiaozhiding.png",
  "icon-RAR1": "https://yx-web-nosdn.netease.im/common/27a743e5696c1ca4416b75c5dde0252c/icon-RAR1.png",
  "icon-shanchu": "https://yx-web-nosdn.netease.im/common/d96f9c0113af4d86dd4e5ecf2e49711b/icon-shanchu.png",
  "icon-shandiao": "https://yx-web-nosdn.netease.im/common/14eea1edc7801449a30700a3c9d604c6/icon-shandiao.png",
  "icon-shezhi": "https://yx-web-nosdn.netease.im/common/698d483a7aacade68ea976f727184e1e/setting.png",
  "icon-shezhi1": "https://yx-web-nosdn.netease.im/common/eced271ac35864b7c716262f1a37217e/icon-shezhi1.png",
  "icon-shipin": "https://yx-web-nosdn.netease.im/common/455c333219318f3b96f748d6753eda4a/icon-shipin.png",
  "icon-shipin8": "https://yx-web-nosdn.netease.im/common/73fededbe5b97dec0246e438d33ae614/icon-shipin8.png",
  "icon-shipinyuyin": "https://yx-web-nosdn.netease.im/common/09b16fe9a2b824ded4162f25333e44e1/icon-shipinyuyin.png",
  "icon-sifenzhisanyidu": "https://yx-web-nosdn.netease.im/common/b1234a4255d3187fa9a767bfed8f4d96/icon-sifenzhisanyidu.png",
  "icon-sifenzhiyiyidu": "https://yx-web-nosdn.netease.im/common/11c7a7e79c57eda20c5ca9d98b0d7e8a/icon-sifenzhiyiyidu.png",
  "icon-sousuo": "https://yx-web-nosdn.netease.im/common/2ccfdfa640c72167f228e7d76068e5f5/icon-sousuo.png",
  "icon-team": "https://yx-web-nosdn.netease.im/common/140e8fbd1cc2df4c878acb17405471f7/icon-team.png",
  "icon-zuojiantou": "https://yx-web-nosdn.netease.im/common/9ab796030ac24a126dedc60fd60613ce/icon-zuojiantou.png",
  "icon-zhuanfa": "https://yx-web-nosdn.netease.im/common/163a3343b0262a76d72d00bbbb4f8ac9/icon-zhuanfa.png",
  "icon-zhongyingwen": "https://yx-web-nosdn.netease.im/common/80a7dbae8c0207f1896e63746ac1a18a/icon-zhongyingwen.png",
  "icon-zhankai": "https://yx-web-nosdn.netease.im/common/d4f655bff9e278ea732adb6a5317bbca/icon-zhankai.png",
  "icon-yinle": "https://yx-web-nosdn.netease.im/common/98a2a366c7e06ab1b1b6ddf9b0c01d73/icon-yinle.png",
  "icon-yidu": "https://yx-web-nosdn.netease.im/common/d17d4aa7866faca55a6a1180c1e15bf6/icon-yidu.png",
  "icon-yanzheng": "https://yx-web-nosdn.netease.im/common/5a0c2769626284ff646298a7ef1f66c2/icon-yanzheng.png",
  "icon-xiaoxizhiding": "https://yx-web-nosdn.netease.im/common/cef2e824e603dde3d333d128434f90c1/icon-xiaoxizhiding.png",
  "icon-xiaoximiandarao": "https://yx-web-nosdn.netease.im/common/1c92731bb3fa91fa3fc5ff45bf9e4dbe/icon-xiaoximiandarao.png",
  "icon-Word": "https://yx-web-nosdn.netease.im/common/af0e4fa22c4b30a263a7f534b0504c23/icon-Word.png",
  "icon-wenjian": "https://yx-web-nosdn.netease.im/common/d3b36fc953447f9d9630f3b73aaa6ef1/icon-wenjian.png",
  "icon-weizhiwenjian": "https://yx-web-nosdn.netease.im/common/d51b39a07b3b482ab3b50a4b068588c6/icon-weizhiwenjian.png",
  "icon-weidu": "https://yx-web-nosdn.netease.im/common/5d50477d2afa387a59a67e30fcdceabd/icon-weidu.png",
  "icon-tupian2": "https://yx-web-nosdn.netease.im/common/51eb954ad971eb6890d0934858f950aa/icon-tupian2.png",
  "icon-tupian1": "https://yx-web-nosdn.netease.im/common/0737f1e187aa250d5090f38925672485/icon-tupian1.png",
  "icon-tupian": "https://yx-web-nosdn.netease.im/common/aa93aa9ffd0197b9a961455506f75078/icon-tupian.png",
  "icon-tuigejian": "https://yx-web-nosdn.netease.im/common/7bca7dffd1f8c3cd66b8ede7f176e4a8/icon-tuigejian.png",
  "icon-tuichudenglu": "https://yx-web-nosdn.netease.im/common/ce42192020620522a46763c758951b76/icon-tuichudenglu.png",
  "icon-touxiang5": "https://yx-web-nosdn.netease.im/common/769a3ba0615b3157d6b493fa5d2352c4/icon-touxiang5.png",
  "icon-touxiang4": "https://yx-web-nosdn.netease.im/common/c6ea2b6557913d2fe8017b68eb688515/icon-touxiang4.png",
  "icon-touxiang3": "https://yx-web-nosdn.netease.im/common/89bbfa21ce6d43fda25a8c4121284db6/icon-touxiang3.png",
  "icon-touxiang2": "https://yx-web-nosdn.netease.im/common/e2e3fdafb9201a0b693b36514eb378ae/icon-touxiang2.png",
  "icon-touxiang1": "https://yx-web-nosdn.netease.im/common/4e639e380f246e804b2f0f115f84215f/icon-touxiang1.png",
  "icon-tongxunlu-xuanzhong": "https://yx-web-nosdn.netease.im/common/f49a558e193325d185223f55b65711bf/icon-tongxunlu-xuanzhong.png",
  "icon-tongxunlu-weixuanzhong": "https://yx-web-nosdn.netease.im/common/e33c24318c1faeb73c79fa1b0b1c9c53/icon-tongxunlu-weixuanzhong.png",
  "icon-tianjiahaoyou": "https://yx-web-nosdn.netease.im/common/c5f19ef12df64f466bba0a611cf224d5/icon-tianjiahaoyou.png",
  "icon-tianjiaanniu": "https://yx-web-nosdn.netease.im/common/181feb34fc6324198f4d9d887a8759e1/icon-tianjiaanniu.png",
  "icon-team2": "https://yx-web-nosdn.netease.im/common/f9d8ea13b9b5d769f75e7f01edcab1df/icon-team2.png",
  "icon-lahei2": "https://yx-web-nosdn.netease.im/common/1ee2a3bffb33b81727583189a2562658/icon-lahei2.png",
  "icon-yuyin1": "https://yx-web-nosdn.netease.im/common/a2169aff2e6d94d93bfaa7d5185f5b0b/icon-yuyin1.png",
  "icon-yuyin2": "https://yx-web-nosdn.netease.im/common/c4b52c33f5688e0cca606665b41d1517/icon-yuyin2.png",
  "icon-yuyin3": "https://yx-web-nosdn.netease.im/common/cbe1ed443546f1a2ac4aa0735f1c2957/icon-yuyin3.png",
  "icon-yuyin8": "https://yx-web-nosdn.netease.im/common/40d631410c18983f6ee0ca880976c2e9/icon-yuyin8.png",
  "icon-audio": "https://yx-web-nosdn.netease.im/common/27c4c8b528fac12d3f79bb3154be87d4/audio1.png",
  "audio-btn": "https://yx-web-nosdn.netease.im/common/abfd3577b9d29bb6d3445979336a5770/Vector.png",
  "audio-btn-selected": "https://yx-web-nosdn.netease.im/common/7f17c648e9b63f40b91832664668ac7a/Frame.png",
  "send-more": "https://yx-web-nosdn.netease.im/common/270ebff9ad75056b857c21f40b55d72d/send-more.png",
  "icon-paishe": "https://yx-web-nosdn.netease.im/common/be9638b843a70f307ecb6803ffe5775c/paishe.png",
  "icon-shipin2": "https://yx-web-nosdn.netease.im/common/3865bf597f9f5ca03b2b222ca07344e1/icon-shipin2.png",
  "icon-audio-call": "https://yx-web-nosdn.netease.im/common/99438364d757b51e7e36c18d254e70e7/icon-audio-call.png",
  "icon-video-call": "https://yx-web-nosdn.netease.im/common/ed7c85a59de3e247d10ecfc684b05226/icon-video-call.png",
  "icon-read": "https://yx-web-nosdn.netease.im/common/309cf305a821ff4bc6759b4ce25abd04/read.png",
  "icon-file": "https://yx-web-nosdn.netease.im/common/feae485e9535bdb0faa81a9eff21e0a8/file.png",
  "icon-pin": "https://yx-web-nosdn.netease.im/common/6eb4fafcca008d2e93e90311696d6b96/black-pin.png",
  "icon-green-pin": "https://yx-web-nosdn.netease.im/common/4a1f15eff2f53563c4f1cf6ecde82d2c/green-pin.png",
  "choose-picture": "https://yx-web-nosdn.netease.im/common/97b3ca79a589d5753cbc0e8e8ec09501/choose-picture.png",
  "icon-collection": "https://yx-web-nosdn.netease.im/common/204be2103545356d425bdb26ab314c5a/add-collection.png",
  "blue-collection": "https://yx-web-nosdn.netease.im/common/709e0f7bb33edcd58efca037afa46af3/collection.png"
};

Component({
  properties: {
    // 图标类型
    type: {
      type: String,
      value: ''
    },
    // 图标大小
    size: {
      type: Number,
      value: 16
    },
    // 图标宽度
    width: {
      type: Number,
      value: 0
    },
    // 图标高度
    height: {
      type: Number,
      value: 0
    },
    // 自定义类名
    iconClassName: {
      type: String,
      value: ''
    },
    // 自定义样式
    iconStyle: {
      type: String,
      value: ''
    }
  },

  data: {
    _url: '',
    computedWidth: 16,
    computedHeight: 16
  },

  observers: {
    'type': function(_type: string) {
      this._updateIcon();
    },
    'size, width, height': function() {
      this._updateSize();
    }
  },

  lifetimes: {
    attached() {
      this._updateIcon();
      this._updateSize();
    }
  },

  methods: {
    /**
     * 更新图标URL
     */
    _updateIcon() {
      const { type } = this.data;
      const url = urlMap[type] || '';
      
      this.setData({
        _url: url
      });
    },

    /**
     * 更新图标尺寸
     */
    _updateSize() {
      const { size, width, height } = this.data;
      
      this.setData({
        computedWidth: width || size,
        computedHeight: height || size
      });
    },

    /**
     * 图片加载错误处理
     */
    onImageError(e: any) {
      console.warn('Icon image load error:', e.detail);
      // 可以设置默认图标或触发错误事件
      this.triggerEvent('error', {
        type: this.data.type,
        error: e.detail
      });
    }
  }
});