
# vim: ft=make noexpandtab

OBJECTS := template.o

BINDIR_LINUX = ../bin/linux
BINDIR_MSP430G2553 = ../bin/msp430g2553

OBJDIR_TESTS = ../obj/test_template

MD=mkdir -v -p

CFLAGS := -Wall -Werror

$(BINDIR_LINUX)/libtemplate.a: OBJDIR := ../obj/linux

$(BINDIR_MSP430G2553)/libtemplate.a: OBJDIR := ../obj/msp430g2553
$(BINDIR_MSP430G2553)/libtemplate.a: AR := msp430-ar
$(BINDIR_MSP430G2553)/libtemplate.a: CC := msp430-gcc
$(BINDIR_MSP430G2553)/libtemplate.a: CFLAGS += \
	-mmcu=msp430g2553 \
	-g \
	-pg \
	-Os \
	-DUSE_DISK_RO \
	-fno-builtin \
	-ffreestanding \
	-nostdlib

test_template: LDFLAGS += $(shell pkg-config --libs check) -L../bin/linux/ -ltemplate
test_template: CFLAGS += -DCHECK -g -Wall -Werror
test_template: OBJDIR := $(OBJDIR_TESTS)

all: $(BINDIR_LINUX)/libtemplate.a $(BINDIR_MSP430G2553)/libtemplate.a

test_template: $(BINDIR_LINUX)/libtemplate.a $(OBJDIR_TESTS)/check.o $(OBJDIR_TESTS)/check_template.o
	$(CC) -o $@ $^ $(LDFLAGS)

$(BINDIR_LINUX)/libtemplate.a: $(addprefix ../obj/linux/,$(OBJECTS))
	$(MD) $(BINDIR_LINUX)
	$(AR) rcs $@ $^

$(BINDIR_MSP430G2553)/libtemplate.a: $(addprefix ../obj/msp430g2553/,$(OBJECTS))
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
	rm -f test_template; \
	rm -rf ../bin

