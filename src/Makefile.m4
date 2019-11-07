
`#' vim: ft=make noexpandtab
divert(-1)
define(`liba', `lib$1.a')
define(`linka', `-l$1')
define(`checka', `check_$1')
define(`testa', `test_$1')
divert(0)
OBJECTS := template.o
OBJECTS_TESTS := $(OBJDIR_TESTS)/check.o $(OBJDIR_TESTS)/checka(template).o

BINDIR_LINUX = ../bin/linux
BINDIR_MSP430G2553 = ../bin/msp430g2553

OBJDIR_TESTS = ../obj/testa(template)

MD=mkdir -v -p

CFLAGS := -Wall -Werror

$(BINDIR_LINUX)/liba(template): OBJDIR := ../obj/linux

$(BINDIR_MSP430G2553)/liba(template): OBJDIR := ../obj/msp430g2553
$(BINDIR_MSP430G2553)/liba(template): AR := msp430-ar
$(BINDIR_MSP430G2553)/liba(template): CC := msp430-gcc
$(BINDIR_MSP430G2553)/liba(template): CFLAGS += \
	-mmcu=msp430g2553 \
	-g \
	-pg \
	-Os \
	-fno-builtin \
	-ffreestanding \
	-nostdlib

testa(template): LDFLAGS += $(shell pkg-config --libs check) -L../bin/linux/ linka(template)
testa(template): CFLAGS += -DCHECK -g -Wall -Werror
testa(template): OBJDIR := $(OBJDIR_TESTS)

all: $(BINDIR_LINUX)/liba(template) $(BINDIR_MSP430G2553)/liba(template)

testa(template): $(BINDIR_LINUX)/liba(template) $(OBJECTS_TESTS)
	$(CC) -o $@ $^ $(LDFLAGS)

$(BINDIR_LINUX)/liba(template): $(addprefix ../obj/linux/,$(OBJECTS))
	$(MD) $(BINDIR_LINUX)
	$(AR) rcs $@ $^

$(BINDIR_MSP430G2553)/liba(template): $(addprefix ../obj/msp430g2553/,$(OBJECTS))
	$(MD) $(BINDIR_MSP430G2553)
	$(AR) rcs $@ $^

../obj/linux/%.o: $(notdir %.c)
	$(MD) $(OBJDIR)
	$(CC) -c -o $@ $< $(CFLAGS)

$(OBJDIR_TESTS)/%.o: ../tests/$(notdir %.c)
	$(MD) $(OBJDIR)
	$(CC) -c -o $@ $< $(CFLAGS)

../obj/msp430g2553/%.o: $(notdir %.c)
	$(MD) $(OBJDIR)
	$(CC) -c -o $@ $< $(CFLAGS)

.PHONY: clean

clean:
	rm -rf ../obj; \
	rm -f testa(template); \
	rm -rf ../bin

