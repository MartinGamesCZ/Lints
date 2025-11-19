FROM fedora:41

RUN dnf install -y \
    gcc \
    gcc-c++ \
    make \
    nasm \
    python3 \
    git \
    qemu-system-x86 \
    wget \
    meson \
    unzip \
  && dnf clean all

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /workspace

CMD ["bash", "-c", "/workspace/scripts/build-picolibc.sh && /workspace/scripts/build-kernel.sh"]