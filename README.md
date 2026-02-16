# X (Twitter) MCP Server

Claude などの AI アシスタントから X (Twitter) を直接操作できる [Model Context Protocol (MCP)](https://modelcontextprotocol.io) サーバーです。

ツイートの投稿・検索、タイムラインの取得、DM の送受信、リストの管理まで ── X API v2 の主要機能を **50 以上のツール** としてカバーしています。

## 何ができるか

自然言語で指示するだけで、AI が X の操作を代行します。

```
「今日の AI 関連の話題を検索して、要約して」
「このツイートに返信して」
「ホームタイムラインを見せて」
```

API を直接叩く必要はありません。Claude との対話の中で、シームレスに X を操作できます。

## セットアップ

### 前提条件

- **Node.js** v18 以上
- **X Developer Portal** のアカウントと API キー（OAuth 1.0a User Context）

### 1. API キーの取得

[X Developer Portal](https://developer.x.com/) でプロジェクトを作成し、以下の 4 つの値を取得してください。

| キー名 | 説明 |
|---|---|
| `X_API_KEY` | API Key (Consumer Key) |
| `X_API_SECRET` | API Secret (Consumer Secret) |
| `X_ACCESS_TOKEN` | Access Token |
| `X_ACCESS_TOKEN_SECRET` | Access Token Secret |

> **注意:** ツイートの投稿や DM の送信には、App permissions を **Read and write** 以上に設定する必要があります。

### 2. MCP サーバーの登録

#### Claude Code (CLI)

`npx` 経由で実行するため、クローンやビルドは不要です。

```bash
claude mcp add x-twitter \
  -e X_API_KEY=あなたのAPIキー \
  -e X_API_SECRET=あなたのAPIシークレット \
  -e X_ACCESS_TOKEN=あなたのアクセストークン \
  -e X_ACCESS_TOKEN_SECRET=あなたのアクセストークンシークレット \
  -- npx -y x-twitter-mcp
```

#### Claude Desktop

`claude_desktop_config.json` に以下を追加します。

```json
{
  "mcpServers": {
    "x-twitter-mcp": {
      "command": "npx",
      "args": ["-y", "x-twitter-mcp"],
      "env": {
        "X_API_KEY": "あなたのAPIキー",
        "X_API_SECRET": "あなたのAPIシークレット",
        "X_ACCESS_TOKEN": "あなたのアクセストークン",
        "X_ACCESS_TOKEN_SECRET": "あなたのアクセストークンシークレット"
      }
    }
  }
}
```

### 3. ツールのカスタマイズ（任意）

環境変数で、有効にするツールを制御できます。未指定の場合はすべてのツール（53個）が有効になります。

#### `X_ENABLED_GROUPS` — グループ単位で有効化

カテゴリと操作タイプを `カテゴリ:操作` の形式で指定します。カンマ区切りで複数指定できます。

```bash
# 取得系のツイート機能だけ使う
X_ENABLED_GROUPS=tweets:get

# ツイート全操作 + タイムライン取得 + ユーザー取得
X_ENABLED_GROUPS=tweets,timelines:get,users:get
```

利用可能なグループ:

| グループ | 含まれるツール |
|---|---|
| `tweets:post` | `post_tweet` |
| `tweets:delete` | `delete_tweet` |
| `tweets:get` | `get_tweet`, `get_tweets`, `search_tweets`, `get_quote_tweets` |
| `timelines:get` | `get_home_timeline`, `get_user_tweets`, `get_user_mentions` |
| `engagement:post` | `like_tweet`, `retweet`, `bookmark_tweet` |
| `engagement:delete` | `unlike_tweet`, `unretweet`, `delete_bookmark` |
| `engagement:get` | `get_liked_tweets`, `get_bookmarks` |
| `users:post` | `follow_user` |
| `users:delete` | `unfollow_user` |
| `users:get` | `get_me`, `get_user`, `get_users`, `get_user_by_username`, `get_users_by_usernames`, `get_followers`, `get_following` |
| `blocks-mutes:post` | `block_user`, `mute_user` |
| `blocks-mutes:delete` | `unblock_user`, `unmute_user` |
| `dm:post` | `send_dm`, `send_dm_in_conversation`, `create_dm_conversation` |
| `dm:get` | `get_dm_events`, `get_dm_conversation` |
| `lists:post` | `create_list`, `update_list`, `add_list_member`, `follow_list`, `pin_list` |
| `lists:delete` | `delete_list`, `remove_list_member`, `unfollow_list`, `unpin_list` |
| `lists:get` | `get_list`, `get_list_tweets`, `get_owned_lists`, `get_list_members`, `get_followed_lists`, `get_pinned_lists` |
| `media:post` | `upload_media`, `upload_media_from_url` |
| `usage:get` | `get_api_usage` |

カテゴリ名だけを指定すると、そのカテゴリの全操作が有効になります（例: `tweets` = `tweets:post` + `tweets:delete` + `tweets:get`）。

#### `X_DISABLED_TOOLS` — 個別ツールを除外

ツール名をカンマ区切りで指定して、特定のツールだけを無効にできます。`X_ENABLED_GROUPS` と併用可能です。

```bash
# 全ツール有効だが、投稿と DM 送信だけ無効に
X_DISABLED_TOOLS=post_tweet,send_dm,delete_tweet
```

#### 設定例

以下はよくある使い方に合わせたおすすめの設定です。`env` ブロック内の API キー（`X_API_KEY` 等）は省略しています。

---

**1. 情報収集だけしたい人**
TL やツイートを AI に要約してもらいたいが、誤操作で投稿されるのは困る。

```
X_ENABLED_GROUPS=tweets:get,timelines:get,users:get,usage:get
```

---

**2. ツイートの下書き・投稿を任せたい人**
AI にツイート案を考えてもらい、そのまま投稿まで任せたい。

```
X_ENABLED_GROUPS=tweets:post,tweets:get,media:post
```

---

**3. タイムラインを見て投稿したい人**
TL のトレンドを AI にまとめてもらい、それを踏まえたツイートを投稿したい。

```
X_ENABLED_GROUPS=tweets:post,tweets:get,timelines:get,users:get,media:post
```

---

**4. エンゲージメント担当として使いたい人**
気になるツイートに「いいね」やリツイートをしたり、ブックマークを整理したい。

```
X_ENABLED_GROUPS=engagement,tweets:get,timelines:get
```

---

**5. フォロワー分析・コミュニティ管理をしたい人**
フォロワーやフォロー中のユーザーを分析し、リストで整理したい。

```
X_ENABLED_GROUPS=users:get,lists,tweets:get
```

---

**6. DM の確認・返信を任せたい人**
未読の DM を確認して返信したい。ツイート機能は不要。

```
X_ENABLED_GROUPS=dm,users:get
```

---

**7. リサーチ・競合分析をしたい人**
特定のキーワードやアカウントを調査し、傾向をまとめたい。

```
X_ENABLED_GROUPS=tweets:get,timelines:get,users:get,engagement:get
```

---

**8. 投稿だけは絶対にさせたくない人**
全機能を使いたいが、ツイートの投稿・削除と DM 送信だけは手動でやりたい。

```
X_DISABLED_TOOLS=post_tweet,delete_tweet,send_dm,send_dm_in_conversation,create_dm_conversation
```

---

**9. 破壊的操作を禁止したい人**
情報の取得や投稿はOKだが、削除・ブロック・アンフォロー等の取り消しにくい操作は防ぎたい。

```
X_DISABLED_TOOLS=delete_tweet,unlike_tweet,unretweet,delete_bookmark,unfollow_user,block_user,unblock_user,mute_user,unmute_user,delete_list,remove_list_member,unfollow_list,unpin_list
```

---

**10. フルアクセス（デフォルト）**
すべての機能を AI に任せる。環境変数の指定は不要。

```
（X_ENABLED_GROUPS, X_DISABLED_TOOLS ともに未指定）
```

#### ソースから直接使う場合

```bash
git clone https://github.com/sunu-py-jp/x-twitter-mcp.git
cd x-twitter-mcp
npm install
npm run build
```

MCP サーバーの登録時に `npx -y x-twitter-mcp` の代わりに `node /path/to/x-twitter-mcp/dist/index.js` を指定してください。

## 機能一覧

### ツイート

| ツール | 説明 |
|---|---|
| `post_tweet` | ツイートの投稿（リプライ・引用・メディア添付対応） |
| `delete_tweet` | ツイートの削除 |
| `get_tweet` | ツイートの詳細取得 |
| `get_tweets` | 複数ツイートの一括取得 |
| `search_tweets` | 直近 7 日間のツイート検索 |
| `get_quote_tweets` | 引用ツイートの取得 |

### タイムライン

| ツール | 説明 |
|---|---|
| `get_home_timeline` | ホームタイムラインの取得 |
| `get_user_tweets` | 特定ユーザーのツイート一覧 |
| `get_user_mentions` | 特定ユーザーへのメンション一覧 |

### エンゲージメント

| ツール | 説明 |
|---|---|
| `like_tweet` / `unlike_tweet` | いいね / 取り消し |
| `retweet` / `unretweet` | リツイート / 取り消し |
| `bookmark_tweet` / `delete_bookmark` | ブックマーク / 取り消し |
| `get_liked_tweets` | いいねしたツイート一覧 |
| `get_bookmarks` | ブックマーク一覧 |

### ユーザー

| ツール | 説明 |
|---|---|
| `get_me` | 認証済みユーザーの情報 |
| `get_user` / `get_users` | ユーザー ID で情報取得 |
| `get_user_by_username` / `get_users_by_usernames` | ユーザー名で情報取得 |
| `follow_user` / `unfollow_user` | フォロー / 解除 |
| `get_followers` | フォロワー一覧 |
| `get_following` | フォロー中のユーザー一覧 |

### ブロック・ミュート

| ツール | 説明 |
|---|---|
| `block_user` / `unblock_user` | ブロック / 解除 |
| `mute_user` / `unmute_user` | ミュート / 解除 |

### ダイレクトメッセージ

| ツール | 説明 |
|---|---|
| `get_dm_events` | DM イベント一覧（直近 30 日） |
| `get_dm_conversation` | 会話のメッセージ取得 |
| `send_dm` | 1 対 1 の DM 送信 |
| `send_dm_in_conversation` | 既存の会話への返信 |
| `create_dm_conversation` | グループ DM の作成 |

### リスト

| ツール | 説明 |
|---|---|
| `get_list` / `create_list` / `update_list` / `delete_list` | リストの CRUD |
| `get_list_tweets` | リスト内のツイート取得 |
| `get_list_members` / `add_list_member` / `remove_list_member` | メンバー管理 |
| `get_owned_lists` / `get_followed_lists` | 所有・フォロー中のリスト |
| `follow_list` / `unfollow_list` | リストのフォロー / 解除 |
| `pin_list` / `unpin_list` / `get_pinned_lists` | リストのピン留め管理 |

### メディア

| ツール | 説明 |
|---|---|
| `upload_media` | ローカルファイルからメディアをアップロード |
| `upload_media_from_url` | URL からメディアをアップロード |

### その他

| ツール | 説明 |
|---|---|
| `get_api_usage` | API のレートリミット状況を確認 |

## ユースケース

### 情報収集と要約

```
ホームタイムラインの最新 30 件を取得して、話題をカテゴリ別に整理して
```

```
「MCP server」に関するツイートを検索して、どんな意見があるかまとめて
```

```
@username の最近のツイートを 20 件取得して、どんな発信をしているか教えて
```

### ツイートの投稿・管理

```
以下の内容でツイートして：
Claude からツイートのテスト中です。MCP サーバー経由で投稿しています。
```

```
このツイート（ID: 1234567890）に「参考になりました！」と返信して
```

```
下書きとして 3 パターンのツイート案を出して。一番良いものを投稿して
```

### エンゲージメント分析

```
自分のブックマークを全部取得して、トピック別に分類して
```

```
自分のいいねの傾向を分析して
```

### フォロー・コミュニティ管理

```
自分のフォロワー一覧を取得して、プロフィールに「エンジニア」と書いてある人をリストアップして
```

```
「AI開発者」というリストを作って、以下のユーザーを追加して
```

### DM の確認

```
最近の DM を確認して、未返信のメッセージがあるか教えて
```

### 画像付きツイート

```
/path/to/image.png をアップロードして、「新機能をリリースしました」というツイートに添付して投稿して
```

## 技術仕様

- **プロトコル:** Model Context Protocol (stdio)
- **API:** X API v2（OAuth 1.0a User Context）
- **ランタイム:** Node.js
- **言語:** TypeScript

## ライセンス

MIT
