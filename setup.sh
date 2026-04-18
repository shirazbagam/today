#!/bin/bash

# 1. Script ko executable banana
chmod +x start_ajkmart.sh

# 2. Purane aliases saaf karna taake duplicate na hon
sed -i '/start_ajkmart.sh/d' ~/.bashrc

# 3. Naye Aliases permanently add karna
echo "alias api='$(pwd)/start_ajkmart.sh api'" >> ~/.bashrc
echo "alias admin='$(pwd)/start_ajkmart.sh admin'" >> ~/.bashrc
echo "alias rider='$(pwd)/start_ajkmart.sh rider'" >> ~/.bashrc
echo "alias vendor='$(pwd)/start_ajkmart.sh vendor'" >> ~/.bashrc
echo "alias ajkmart='$(pwd)/start_ajkmart.sh customer'" >> ~/.bashrc

# 4. Changes apply karna
source ~/.bashrc

echo "✅ AJKMart Setup Complete!"
echo "Ab aap direct 'api', 'admin', ya 'ajkmart' likh kar apps chala sakte hain."
