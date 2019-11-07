divert(-1)
define(`suitea', `$1_suite( void )')
divert(0)
`#'include <check.h>
`#'include "../src/template.h"

`#'include <stdio.h>

START_TEST( test_example ) {
}
END_TEST

static void setup_example() {
}

static void teardown_example() {
}

Suite* suitea(template) {
   Suite* s = NULL;
   TCase* tc_example = NULL;

   s = suite_create( "template" );

   tc_example = tcase_create( "example" );

   tcase_add_checked_fixture(
      tc_example, setup_example, teardown_example );

   tcase_add_loop_test( tc_example, test_example, 2, 3 );
   tcase_add_test( tc_example, test_example );

   suite_add_tcase( s, tc_example );

   return s;
}

