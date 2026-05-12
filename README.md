# Addon-Repository
アドオン置き場

連携方法(詳しくは https://github.com/HABUPENN/gassakutest_addon)

git clone <リポジトリのURL>

PowerShell（管理者権限）<br>
New-Item -ItemType SymbolicLink -Path Link_BP -Target BP<br>
New-Item -ItemType SymbolicLink -Path Link_RP -Target RP



3.2 変更の作成とコミット<br>
git add .<br>
git commit -m "変更内容の説明"

3.3 リモートリポジトリへの反映（push）<br>
git push

3.4 共同作業時の注意点<br>
push 前に必ず git pull を実行して最新状態を取得する