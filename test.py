from cmath import exp
from math import pi

def integrate_thing2(pa, pb, lo, hi, x0):
    if pa == 0:
        return 1 / (pb+1) * (x0 - lo) ** (pb+1)
    elif pb == 0:
        return -1 / (pa+1) * (hi - x0) ** (pa+1)
    else:
        return (hi - x0) ** pa * 1 / (pb+1) * (x0 - lo) ** (pb+1) - (-pa) * (1 / (pb+1)) * integrate_thing2(pa-1, pb+1, lo, hi, x0)
    
def integrate_thing(pa, pb, lo, hi, w, x0):
    if abs(w) < 1e-9:
        return integrate_thing2(pa, pb, lo, hi, x0)

    if pa == 0 and pb == 0:
        return 1 / w * exp(w * x0)
    elif pb == 0:
        return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (-1) * pa * integrate_thing(pa-1, pb, lo, hi, w, x0)
    elif pa == 0:
        return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (+1) * pb * integrate_thing(pa, pb-1, lo, hi, w, x0)
    else:
        return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (-1) * pa * integrate_thing(pa-1, pb, lo, hi, w, x0) - (1/w) * (+1) * pb * integrate_thing(pa, pb-1, lo, hi, w, x0)
    
#print(integrate_thing2(3, 4, 0.4, 0.6, 0.6) - integrate_thing2(3, 4, 0.4, 0.6, 0.4))
pa = 2
pb = 3
w = - 2 * pi * 1j
lo = 0.4
hi = 0.6

print(integrate_thing(pa, pb, lo, hi, w, hi) - integrate_thing(pa, pb, lo, hi, w, lo))