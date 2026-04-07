# Use the official Apify Node.js base image (lightweight, no browser)
# apify/actor-node is pre-cached on Apify servers for fast builds
FROM apify/actor-node:22

# Copy package files first (Docker layer caching — faster rebuilds)
COPY --chown=myuser:myuser package*.json ./

# Install only production dependencies
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -rf ~/.npm

# Copy the rest of the source code
COPY --chown=myuser:myuser . ./