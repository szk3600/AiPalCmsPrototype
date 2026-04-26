作業開始前は必ず Pull:
メインPCで変更を加えた後は、ノートPC側で必ず最新の状態を取り込みます。

git pull origin main


作業終了後は必ず Push:
たとえ作業が途中でも、コミットして Push しておけば別のPCですぐに再開できます。

git add .
git commit -m "WIP: 〇〇の実装中"
git push origin main

