import { MemoStore } from "@/@types/store-data";
import {
  createDiceRollStr,
  createEmotion,
  createTokugi,
  outputPersonalityList,
  outputTableList,
  outputTokugiChatPalette,
  outputTokugiTable,
  Personality,
  readPersonalityList,
  readTokugiTableInfo,
  SaikoroFictionTokugi,
  tabTextProcess
} from "@/app/core/utility/trpg_system/SaikoroFiction";
import { TrpgSystemHelper } from "@/app/core/utility/trpg_system/TrpgSystemHelper";
import moment from "moment";

export class ShinobigamiHelper extends TrpgSystemHelper<Shinobigami> {
  public readonly isSupportedOtherText = true;
  public readonly isSupportedChatPalette = true;

  public constructor(url: string) {
    super(
      url,
      /https?:\/\/character-sheets\.appspot\.com\/shinobigami\/.+\?key=([^&]+)/,
      "https://character-sheets.appspot.com/shinobigami/display?ajax=1&key={key}"
    );
  }

  /**
   * このシステムに対応しているキャラシのURLかどうかを判定する
   * @return true: 対応したキャラシである, false: 対応したキャラシではない
   */
  public async isThis(): Promise<boolean> {
    return this.urlRegExp.test(this.url);
  }

  /**
   * その他欄の情報を生成する
   */
  public async createOtherText(
    memoList: Partial<StoreData<MemoStore>>[]
  ): Promise<Partial<StoreData<MemoStore>>[] | null> {
    const { data, list } = await this.createResultList<MemoStore>();
    if (!data) return null;

    readData(data, memoList);

    // メモ
    this.addMemo(list, []);
    // 基本情報
    addBasic(data, list);
    // 特技
    addTokugi(data, list);
    // 忍法
    addNinpou(data, list);

    return list;
  }

  /**
   * チャットパレットの情報を生成する
   */
  public async createChatPalette(): Promise<
    {
      name: string;
      paletteText: string;
    }[]
  > {
    const { data } = await this.createResultList<string>();
    if (!data) return [];

    return [
      {
        name: `◆${data.characterName}`,
        paletteText: [
          "2D6",
          "2D6>=",
          ...outputTokugiChatPalette(data.tokugi),
          "ST (無印)シーン表",
          "FT ファンブル表",
          "ET 感情表",
          "KWT 変調表",
          "RTT ランダム特技決定表",
          "D66",
          "choice[〇〇,△△,□□]",
          "",
          "兵糧丸を１つ使用",
          "兵糧丸を１つ獲得",
          "神通丸を１つ使用",
          "神通丸を１つ獲得",
          "遁甲符を１つ使用",
          "遁甲符を１つ獲得",
          ...data.ninpouList
            .flatMap(n => [
              "",
              `【${n.name}】《${n.targetSkill}》ｺｽﾄ：${n.cost ||
                "なし"}／間合:${n.range || "なし"}`,
              `効果:${n.effect}`
            ])
            .map(text => text.replaceAll(/\r?\n/g, ""))
        ].join("\n")
      }
    ];
  }

  /**
   * JSONPから取得した生データから処理用のデータを生成する
   * @param json JSONPから取得した生データ
   * @protected
   */
  protected createData(json: any): Shinobigami | null {
    if (!json) return null;
    const textFilter = (text: string | null) => {
      if (!text) return "";
      return text.trim().replace(/\r?\n/g, "\n");
    };
    return {
      url: this.url,
      playerName: textFilter(json["base"]["player"]),
      characterName: textFilter(json["base"]["name"]),
      characterNameKana: textFilter(json["base"]["nameKana"]),
      foe: textFilter(json["base"]["foe"]),
      exp: textFilter(json["base"]["exp"]),
      memo: textFilter(json["base"]["memo"]),
      upperStyle: upperStyleDict[json["base"]["upperstyle"]] || "",
      subStyle: textFilter(json["base"]["substyle"]),
      level: textFilter(json["base"]["level"]),
      age: textFilter(json["base"]["age"]),
      sex: textFilter(json["base"]["sex"]),
      cover: textFilter(json["base"]["cover"]),
      belief: textFilter(json["base"]["belief"]),
      stylerule: textFilter(json["base"]["stylerule"]),
      ninpouList: (json["ninpou"] as any[]).map(n => ({
        secret: !!n["secret"],
        name: textFilter(n["name"]),
        type: textFilter(n["type"]),
        targetSkill: textFilter(n["targetSkill"]),
        range: textFilter(n["range"]),
        cost: textFilter(n["cost"]),
        effect: textFilter(n["effect"]),
        page: textFilter(n["page"])
      })),
      personalityList: createEmotion(json),
      scenario: {
        handout: textFilter(json["scenario"]["handout"]),
        mission: textFilter(json["scenario"]["mission"]),
        name: textFilter(json["scenario"]["name"]),
        pcno: textFilter(json["scenario"]["pcno"])
      },
      backgroundList: (json["background"] as any[]).map(b => ({
        name: textFilter(b["name"]),
        type: textFilter(b["type"]),
        point: b["point"] || "0",
        effect: textFilter(b["effect"])
      })),
      tokugi: createTokugi(
        json,
        tokugiTable,
        true,
        false,
        false,
        (tokugi: SaikoroFictionTokugi, t: string, tt: string, move: number) =>
          `@@@CHAT-CMD:[${move}]SG>=${move} ${t}→${tt}@@@`
      )
    };
  }
}

const gapColList = [
  { spaceIndex: 5, colText: "器術" },
  { spaceIndex: 0, colText: "体術" },
  { spaceIndex: 1, colText: "忍術" },
  { spaceIndex: 2, colText: "謀術" },
  { spaceIndex: 3, colText: "戦術" },
  { spaceIndex: 4, colText: "妖術" }
];

const upperStyleDict: { [key: string]: string } = {
  a: "斜歯忍軍",
  ab: "鞍馬神流",
  bc: "ハグレモノ",
  cd: "比良坂機関",
  de: "私立御斎学園",
  e: "隠忍の血統"
};

const tokugiTable: string[][] = [
  ["絡繰術", "騎乗術", "生存術", "医術", "兵糧術", "異形化"],
  ["火術", "砲術", "潜伏術", "毒術", "鳥獣術", "召喚術"],
  ["水術", "手裏剣術", "遁走術", "罠術", "野戦術", "死霊術"],
  ["針術", "手練", "盗聴術", "調査術", "地の利", "結界術"],
  ["仕込み", "身体操術", "腹話術", "詐術", "意気", "封術"],
  ["衣装術", "歩法", "隠形術", "対人術", "用兵術", "言霊術"],
  ["縄術", "走法", "変装術", "遊芸", "記憶術", "幻術"],
  ["登術", "飛術", "香術", "九ノ一の術", "見敵術", "瞳術"],
  ["拷問術", "骨法術", "分身の術", "傀儡の術", "暗号術", "千里眼の術"],
  ["壊器術", "刀術", "隠蔽術", "流言の術", "伝達術", "憑依術"],
  ["掘削術", "怪力", "第六感", "経済力", "人脈", "呪術"]
];

type Haikei = {
  name: string;
  type: string;
  point: string;
  effect: string;
};

type Ninpou = {
  secret: boolean;
  name: string;
  type: string;
  targetSkill: string;
  range: string;
  cost: string;
  effect: string;
  page: string;
};

type Shinobigami = {
  url: string;
  playerName: string;
  characterName: string;
  characterNameKana: string;
  foe: string;
  exp: string;
  memo: string;
  upperStyle: string;
  subStyle: string;
  level: string;
  age: string;
  sex: string;
  cover: string;
  belief: string;
  stylerule: string;
  ninpouList: Ninpou[]; // 忍法
  personalityList: Personality[]; // 人物欄
  scenario: {
    handout: string;
    mission: string;
    name: string;
    pcno: string;
  };
  backgroundList: Haikei[]; // 背景
  tokugi: SaikoroFictionTokugi; // 特技
};

function readData(
  data: Shinobigami,
  memoList: Partial<StoreData<MemoStore>>[]
) {
  tabTextProcess("基本情報", memoList, text => {
    readPersonalityList(data, text, [
      { label: "キャラ", prop: "name" },
      { label: "居", prop: "place" },
      { label: "秘", prop: "secret" },
      { label: "奥", prop: "specialEffect" },
      { label: "感情", prop: "emotion" }
    ]);
  });

  tabTextProcess("特技", memoList, text => {
    readTokugiTableInfo(
      data.tokugi,
      gapColList,
      tokugiTable,
      text,
      true,
      false,
      ""
    );

    // 最後の行の上下輪転のチェックボックスの値をとる
    const crs = "\\[([ x])]　*";
    const lcs = "\\|¦?　*";
    const regStr2 =
      [...new Array(13)].reduce(
        (a, c, idx) => `${a}${lcs}${!idx ? crs : ""}`,
        ""
      ) + "\\|";
    const matchResult2 = text.match(new RegExp(regStr2));
    if (matchResult2) {
      data.tokugi.outRow = matchResult2[1] === "x";
    }
  });
}

function addBasic(
  data: Shinobigami,
  resultList: Partial<StoreData<MemoStore>>[]
) {
  resultList.push({
    data: {
      tab: "基本情報",
      type: "url",
      text: [
        `@@@RELOAD-CHARACTER-SHEET-ALL@@@ ${moment().format(
          "YYYY/MM/DD HH:mm:ss"
        )}`,
        "リロードしてもチェック状態や選択状態は引き継がれます",
        "## 基本情報",
        `PL: ${data.playerName}`,
        `PC${data.scenario.pcno ? `(${data.scenario.pcno})` : ""}: ${
          data.characterName
        }${data.characterNameKana ? `（${data.characterNameKana}）` : ""}`,
        `${data.level} ${data.belief} ${data.age} ${data.sex} ${data.cover}`,
        `流派：${data.upperStyle}${
          data.subStyle ? `（${data.subStyle}）` : ""
        }`,
        `流儀: ${data.stylerule}`,
        `使命: ${data.scenario.mission}`,
        "",
        "## 人物欄",
        ...outputPersonalityList(data.personalityList, [
          { label: "キャラ", prop: "name", align: "left" },
          { label: "居", prop: "place", align: "left" },
          { label: "秘", prop: "secret", align: "left" },
          { label: "奥", prop: "specialEffect", align: "left" },
          { label: "感情", prop: "emotion", align: "left" }
        ]),
        "",
        "## 背景",
        ...outputTableList<Haikei>(data.backgroundList, [
          { label: "名称", prop: "name", align: "left" },
          { label: "種別", prop: "type", align: "left" },
          { label: "功績点", prop: "point", align: "left" },
          { label: "効果", prop: "effect", align: "left" }
        ])
      ].join("\r\n")
    }
  });
}

function addTokugi(
  data: Shinobigami,
  resultList: Partial<StoreData<MemoStore>>[]
) {
  resultList.push({
    data: {
      tab: "特技",
      type: "url",
      text: [
        `@@@RELOAD-CHARACTER-SHEET-ALL@@@ ${moment().format(
          "YYYY/MM/DD HH:mm:ss"
        )}`,
        "リロードしてもギャップやダメージのチェック状態は引き継がれます",
        "## 特技",
        ...outputTokugiTable(data.tokugi, gapColList),
        `|${[...new Array(13)]
          .map((_, idx) => {
            if (!idx) return data.tokugi.outRow ? "¦[x]" : "[ ]";
            return data.tokugi.outRow ? "¦　" : "　";
          })
          .join("|")}|`
      ].join("\r\n")
    }
  });
}

function addNinpou(
  data: Shinobigami,
  resultList: Partial<StoreData<MemoStore>>[]
) {
  resultList.push({
    data: {
      tab: "忍法",
      type: "url",
      text: [
        `@@@RELOAD-CHARACTER-SHEET-ALL@@@ ${moment().format(
          "YYYY/MM/DD HH:mm:ss"
        )}`,
        "## 忍法",
        ...outputTableList<Ninpou>(
          data.ninpouList,
          [
            { label: "忍法", prop: "name", align: "left" },
            { label: "", prop: "name", align: "left" },
            { label: "タイプ", prop: "type", align: "left" },
            { label: "指定特技", prop: "targetSkill", align: "left" },
            { label: "間合", prop: "range", align: "right" },
            { label: "コスト", prop: "cost", align: "right" },
            { label: "効果", prop: "effect", align: "left" },
            { label: "参照p", prop: "page", align: "left" }
          ],
          (prop, value, data1) => {
            if (prop.prop === "targetSkill") {
              const diceRollStr = createDiceRollStr(
                data.tokugi,
                gapColList,
                data1.targetSkill
              );
              return `${value}${diceRollStr}`;
            }
            if (prop.label === "") {
              return `@@@CHAT-CMD:[宣言]【${value}】《${data1.targetSkill}》コスト：${data1.cost}／間合：${data1.range}@@@`;
            }
            return null;
          }
        )
      ].join("\r\n")
    }
  });
}
