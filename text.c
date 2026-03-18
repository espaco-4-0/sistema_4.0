#include <stdlib.h>

int *somente_pares(int n, int *v, int *npares) {
    int i, count = 0;
    for (i = 0; i < n; i++) {
        if (v[i] % 2 == 0) {
            count++;
        }
    }
    *npares = count;
    int *novo = (int *) malloc(count * sizeof(int));
    if (novo == NULL) {
        *npares = 0;
        return NULL;
    }
    int j = 0;
    for (i = 0; i < n; i++) {
        if (v[i] % 2 == 0) {
            novo[j++] = v[i];
        }
    }
    return novo;
}
