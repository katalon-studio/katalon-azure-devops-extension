cd katalonTask 
rmdir /s /q build
call npx babel src --out-dir build
cd ..
call tfx extension create --manifest-globs vss-extension.json