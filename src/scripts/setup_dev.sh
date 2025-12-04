cp ./src/scripts/dev-setup/default.clangd .clangd && sed -i.bak "s|%%workspaceFolder%%|$(pwd)|g" .clangd && rm .clangd.bak
