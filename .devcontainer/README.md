# Dev Container Setup

## Setting Up Git

After starting your dev container, you may want to configure Git to make commits. You can do this by running the following commands in the terminal inside the container:

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

Replace `"Your Name"` with your actual name and `youremail@example.com` with your email address.

### Additional Configuration

If you want to ensure that your workspace is recognized as a safe directory and to disable file mode checking, you can also run:

```bash
git config --global --add safe.directory /workspaces/entix-api
git config --global core.filemode false
```

This setup will help you avoid permission issues when working with Git in the container.
